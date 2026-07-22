import { GoogleGenerativeAI } from '@google/generative-ai';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export const generateAIResponse = async (message: string): Promise<{ text: string; action?: string }> => {
  const store = useFinanceStore.getState();
  const { accounts, transactions, budgets, currency, user } = store;

  // Demo fallback mode if API fails or key is unconfigured
  if (!API_KEY || API_KEY.startsWith('YOUR_')) {
    return getDemoResponse(message, store);
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    const contextPrompt = `You are Nexus AI, a personal finance assistant in the CoinBurst mobile app.
Current User Context:
- Name: ${user?.displayName || 'User'}
- Currency: ${currency}
- Total Net Worth: ${formatCurrency(totalBalance, currency)}
- Total Income: ${formatCurrency(totalIncome, currency)}
- Total Expense: ${formatCurrency(totalExpense, currency)}
- Accounts Count: ${accounts.length}
- Transactions Count: ${transactions.length}
- Budgets Count: ${budgets.length}

Answer the user concisely and helpfully in markdown. User Query: "${message}"`;

    const result = await model.generateContent(contextPrompt);
    const responseText = result.response.text();

    return { text: responseText };
  } catch (error: any) {
    console.error('Native AI Engine Error:', error);
    return getDemoResponse(message, store);
  }
};

const getDemoResponse = (message: string, store: any) => {
  const query = message.toLowerCase();
  const fmt = (val: number) => formatCurrency(val, store.currency);

  if (query.includes('balance') || query.includes('net worth') || query.includes('summary')) {
    const total = store.accounts.reduce((s: number, a: any) => s + a.balance, 0);
    return { text: `💳 **Portfolio Summary**\n\nYour total net worth is **${fmt(total)}** across ${store.accounts.length} active account(s).` };
  }
  if (query.includes('expense') || query.includes('spent')) {
    const totalExp = store.transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
    return { text: `📉 **Expense Overview**\n\nYou have spent a total of **${fmt(totalExp)}** in logged transactions.` };
  }
  if (query.includes('income') || query.includes('earned')) {
    const totalInc = store.transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
    return { text: `📈 **Income Overview**\n\nYour total recorded income is **${fmt(totalInc)}**.` };
  }
  return { text: `🤖 **Nexus AI Advisor**\n\nI analyzed your query: "${message}". Your financial health looks stable with ${store.transactions.length} recorded entries.` };
};
