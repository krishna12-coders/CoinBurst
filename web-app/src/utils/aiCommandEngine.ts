import { GoogleGenAI, Type } from '@google/genai';

// Initialize the SDK. We expect VITE_GEMINI_API_KEY in the environment.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Create client (will handle the case where apiKey is missing gracefully in the function)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type AIResult = { text: string; action?: () => void };

export const generateAIResponse = async (
  message: string,
  state: { accounts: any[]; transactions: any[]; budgets: any[] },
  currency: string,
  store: {
    addTransaction: (t: any) => any;
    deleteTransaction: (id: string) => void;
    addAccount: (a: any) => void;
    deleteAccount: (id: string) => void;
    addBudget: (b: any) => void;
    deleteBudget: (id: string) => void;
    setTheme: (t: any) => void;
    setCurrency: (c: string) => void;
    onNavigate: (p: any) => void;
  }
): Promise<AIResult> => {
  if (!ai) {
    return { text: `⚠️ **API Key Missing!** Please add \`VITE_GEMINI_API_KEY\` to your \`.env\` file in the \`web-app\` directory to activate the AI Advisor.` };
  }

  // Define tools
  const tools = [{
    functionDeclarations: [
      {
        name: 'add_transaction',
        description: 'Log a new income or expense transaction.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'Must be "income" or "expense"' },
            amount: { type: Type.NUMBER, description: 'The monetary amount' },
            category: { type: Type.STRING, description: 'Category (e.g. Food, Salary, Entertainment)' },
            description: { type: Type.STRING, description: 'A short description of the transaction' },
            accountId: { type: Type.STRING, description: 'Optional ID of the account. Leave null if not specified.' }
          },
          required: ['type', 'amount', 'category', 'description']
        }
      },
      {
        name: 'create_account',
        description: 'Create a new financial account/wallet.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the account (e.g. Chase Bank, Cash Wallet)' },
            type: { type: Type.STRING, description: 'Must be "cash", "bank", or "credit"' },
            balance: { type: Type.NUMBER, description: 'Initial balance amount' }
          },
          required: ['name', 'type', 'balance']
        }
      },
      {
        name: 'set_budget',
        description: 'Set a new budget limit for a specific category.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Category (e.g. Food, Entertainment, Shopping)' },
            limit: { type: Type.NUMBER, description: 'The monthly limit amount' }
          },
          required: ['category', 'limit']
        }
      },
      {
        name: 'change_theme',
        description: 'Change the application theme.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING, description: 'Must be one of: "dark", "light", "cyberpunk", "glass", "forest", "synthwave"' }
          },
          required: ['theme']
        }
      },
      {
        name: 'navigate_page',
        description: 'Navigate to a different page in the application.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            page: { type: Type.STRING, description: 'Must be one of: "dashboard", "transactions", "budgets", "settings", "ai", "about"' }
          },
          required: ['page']
        }
      }
    ]
  }];

  const systemInstruction = `You are the CoinBurst AI Financial Advisor. You manage a user's personal finances.
Your goal is to answer their financial questions based on their state, give advice, or perform actions using the provided tools.
Whenever the user asks to add/log a transaction, create an account, set a budget, change the theme, or navigate, YOU MUST USE THE CORRESPONDING TOOL.
Current Currency: ${currency}
Current State Context:
- Accounts: ${JSON.stringify(state.accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance })))}
- Recent Transactions (last 10): ${JSON.stringify(state.transactions.slice(0, 10).map(t => ({ id: t.id, type: t.type, amount: t.amount, category: t.category, description: t.description })))}
- Active Budgets: ${JSON.stringify(state.budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })))}

Format your responses using Markdown. Be concise, helpful, and adopt a sleek, slightly futuristic advisor tone (e.g., using terms like 'Ledger', 'Inbound Capital', 'Vault'). If a tool call is needed, just call the tool.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        tools: tools,
        systemInstruction: systemInstruction,
        temperature: 0.2,
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const args = call.args as Record<string, any>;

      let action: (() => void) | undefined = undefined;
      let replyText = response.text || '';

      if (call.name === 'add_transaction') {
        const targetAccount = args.accountId ? state.accounts.find(a => a.id === args.accountId) : state.accounts[0];
        if (!targetAccount) {
          return { text: `⚠️ You need at least one account to log a transaction. Please create one first.` };
        }
        
        const newTx = {
          accountId: targetAccount.id,
          type: args.type,
          category: args.category,
          amount: args.amount,
          description: args.description,
          date: new Date().toISOString(),
        };
        
        action = () => store.addTransaction(newTx);
        if (!replyText) replyText = `✅ Logged ${args.type} of **${formatAmount(args.amount, currency)}** for ${args.category} in ${targetAccount.name}.`;
      } 
      else if (call.name === 'create_account') {
        const colors = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const color = colors[state.accounts.length % colors.length];
        action = () => store.addAccount({ name: args.name, type: args.type, balance: args.balance, color });
        if (!replyText) replyText = `✅ Vault Node **${args.name}** established with ${formatAmount(args.balance, currency)}.`;
      }
      else if (call.name === 'set_budget') {
        const now = new Date();
        const month = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}\`;
        action = () => store.addBudget({ category: args.category, limit: args.limit, month });
        if (!replyText) replyText = `✅ Sentinel protocol activated: **${args.category}** limited to ${formatAmount(args.limit, currency)}.`;
      }
      else if (call.name === 'change_theme') {
        action = () => store.setTheme(args.theme);
        if (!replyText) replyText = `🎨 Aesthetic synchronized to **${args.theme}**.`;
      }
      else if (call.name === 'navigate_page') {
        action = () => store.onNavigate(args.page);
        if (!replyText) replyText = `📍 Routing interface to **${args.page}**...`;
      }

      return { text: replyText, action };
    }

    return { text: response.text || "I processed your request, but I didn't have anything to say." };

  } catch (error) {
    console.error("AI Engine Error:", error);
    return { text: `⚠️ **Communication Failure**: Unable to reach the AI core. Please check your API key and connection.` };
  }
};

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch (e) {
    return \`\${currency} \${amount}\`;
  }
};
