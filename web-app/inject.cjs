const fs = require('fs');

let code = fs.readFileSync('src/shared/useFinanceStore.ts', 'utf8');

// 1. Transaction Interface
code = code.replace(
  /  description: string;\n  date: string;\n}/,
  "  description: string;\n  date: string;\n  isRecurring?: 'daily' | 'weekly' | 'monthly' | 'none';\n  nextRecurrenceDate?: string;\n}"
);

// 2. Budget Interface
code = code.replace(
  /  category: string;\n  limit: number;\n  spent: number;\n  month: string;\n}/,
  "  category: string;\n  limit: number;\n  assigned: number;\n  spent: number;\n  month: string;\n}"
);

// 3. FinanceState Interface
code = code.replace(
  /  updateTransaction: \(updatedTx: Transaction\) => void;\n}/,
  "  updateTransaction: (updatedTx: Transaction) => void;\n  xp: number;\n  level: number;\n  streakDays: number;\n  lastActiveDate: string | null;\n  addXP: (amount: number) => void;\n  processRecurringTransactions: () => void;\n  checkStreak: () => void;\n  transferToBudget: (budgetId: string, amount: number) => void;\n}"
);

// 4. Initial State
code = code.replace(
  /      selectedAccountId: null,\n      user: null,\n      loading: false,/,
  "      selectedAccountId: null,\n      user: null,\n      loading: false,\n      xp: 0,\n      level: 1,\n      streakDays: 0,\n      lastActiveDate: null,"
);

// 5. addTransaction integration (Give XP)
// The original is:
//         if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);
//         return newTransaction;
code = code.replace(
  /        if \(user\) saveStateToFirebase\(user\.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency\);\n\n        return newTransaction;/g,
  "        if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);\n\n        get().addXP(10);\n        return newTransaction;"
);

// 6. addBudget integration (handle assigned field)
// The original is:
//         const newBudget: Budget = { ...budgetData, id, spent: 0 };
code = code.replace(
  /const newBudget: Budget = \{ \.\.\.budgetData, id, spent: 0 \};/g,
  "const newBudget: Budget = { ...budgetData, assigned: (budgetData as any).assigned || 0, id, spent: 0 };"
);

// 7. Inject functions before syncData: (data) => {
const fns = `
      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const nextLevelXP = state.level * 1000;
          if (newXP >= nextLevelXP) {
            return { xp: newXP - nextLevelXP, level: state.level + 1 };
          }
          return { xp: newXP };
        });
      },
      
      checkStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          if (state.lastActiveDate === today) return state;
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (state.lastActiveDate === yesterdayStr) {
            return { streakDays: state.streakDays + 1, lastActiveDate: today };
          } else {
            return { streakDays: 1, lastActiveDate: today };
          }
        });
      },
      
      processRecurringTransactions: () => {
        const { transactions, addTransaction } = get();
        const now = new Date();
        
        const recurring = transactions.filter(t => t.isRecurring && t.isRecurring !== 'none' && t.nextRecurrenceDate);
        
        recurring.forEach(tx => {
          const nextDate = new Date(tx.nextRecurrenceDate!);
          if (now >= nextDate) {
            addTransaction({
              accountId: tx.accountId,
              type: tx.type,
              category: tx.category,
              amount: tx.amount,
              description: tx.description + ' (Auto-Recurring)',
              date: nextDate.toISOString(),
            });
            
            const newNext = new Date(nextDate);
            if (tx.isRecurring === 'daily') newNext.setDate(newNext.getDate() + 1);
            else if (tx.isRecurring === 'weekly') newNext.setDate(newNext.getDate() + 7);
            else if (tx.isRecurring === 'monthly') newNext.setMonth(newNext.getMonth() + 1);
            
            set(state => ({
              transactions: state.transactions.map(t => t.id === tx.id ? { ...t, nextRecurrenceDate: newNext.toISOString() } : t)
            }));
          }
        });
      },

      transferToBudget: (budgetId, amount) => {
        set((state) => ({
          budgets: state.budgets.map(b => b.id === budgetId ? { ...b, assigned: (b.assigned || 0) + amount } : b)
        }));
      },

      syncData: (data) => {`;

code = code.replace(/      syncData: \(data\) => \{/, fns);

fs.writeFileSync('src/shared/useFinanceStore.ts', code);
console.log('Injected successfully');
