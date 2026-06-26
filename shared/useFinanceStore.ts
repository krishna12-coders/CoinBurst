import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Type Definitions ---
export type ThemeType = 'dark' | 'light' | 'cyberpunk';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  selectedTheme: ThemeType;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit';
  balance: number;
  color: string; // Tailwind color classes or Hex
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string; // ISO String
}

export interface Budget {
  id: string;
  category: string; // 'Food', 'Entertainment', 'all' etc.
  limit: number;
  spent: number;
  month: string; // YYYY-MM
}

interface FinanceState {
  theme: ThemeType;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  selectedAccountId: string | null; // Filter transactions by account; null means all
  
  // Actions
  setTheme: (theme: ThemeType) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccountBalance: (accountId: string, amount: number) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  setSelectedAccountId: (id: string | null) => void;
  
  // Bulk sync from remote DB (Firebase/Supabase)
  syncData: (data: { accounts?: Account[]; transactions?: Transaction[]; budgets?: Budget[]; theme?: ThemeType }) => void;
}

// Helper to get current month in YYYY-MM format
const getCurrentMonthString = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}`;
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      accounts: [
        { id: '1', name: 'Everyday Cash', type: 'cash', balance: 1250, color: '#10B981' }, // Green
        { id: '2', name: 'Chase Checking', type: 'bank', balance: 5420, color: '#3B82F6' }, // Blue
        { id: '3', name: 'Gold Credit Card', type: 'credit', balance: -450, color: '#EC4899' }, // Pink
      ],
      transactions: [
        { id: 't1', accountId: '2', type: 'income', category: 'Salary', amount: 3200, description: 'Bi-weekly Direct Deposit', date: '2026-06-25T10:00:00Z' },
        { id: 't2', accountId: '1', type: 'expense', category: 'Food', amount: 45.5, description: 'Sushi dinner with friends', date: '2026-06-26T19:30:00Z' },
        { id: 't3', accountId: '3', type: 'expense', category: 'Entertainment', amount: 120, description: 'Concert Tickets', date: '2026-06-24T14:15:00Z' },
      ],
      budgets: [
        { id: 'b1', category: 'Food', limit: 500, spent: 45.5, month: '2026-06' },
        { id: 'b2', category: 'Entertainment', limit: 300, spent: 120, month: '2026-06' },
        { id: 'b3', category: 'all', limit: 2000, spent: 165.5, month: '2026-06' },
      ],
      selectedAccountId: null,

      setTheme: (theme) => set({ theme }),

      addTransaction: (txData) => {
        const id = 'tx_' + Math.random().toString(36).substring(2, 9);
        const newTransaction: Transaction = { ...txData, id };
        
        const txMonth = getCurrentMonthString(newTransaction.date);
        const amountChange = newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;

        // Retrieve current state
        const { accounts, budgets, transactions } = get();

        // 1. Update Account Balance
        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === newTransaction.accountId) {
            return { ...acc, balance: acc.balance + amountChange };
          }
          return acc;
        });

        // 2. Update Budget Spent (if it is an expense)
        const updatedBudgets = budgets.map((budget) => {
          if (newTransaction.type === 'expense' && budget.month === txMonth) {
            const matchesCategory = budget.category.toLowerCase() === newTransaction.category.toLowerCase();
            const isAllBudget = budget.category === 'all';
            
            if (matchesCategory || isAllBudget) {
              return { ...budget, spent: budget.spent + newTransaction.amount };
            }
          }
          return budget;
        });

        set({
          transactions: [newTransaction, ...transactions],
          accounts: updatedAccounts,
          budgets: updatedBudgets,
        });

        return newTransaction;
      },

      deleteTransaction: (id) => {
        const { transactions, accounts, budgets } = get();
        const txToDelete = transactions.find((t) => t.id === id);
        if (!txToDelete) return;

        const txMonth = getCurrentMonthString(txToDelete.date);
        // Deleting transaction reverses its balance effect
        const amountChange = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;

        // 1. Revert Account Balance
        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === txToDelete.accountId) {
            return { ...acc, balance: acc.balance + amountChange };
          }
          return acc;
        });

        // 2. Revert Budget Spent (if it was an expense)
        const updatedBudgets = budgets.map((budget) => {
          if (txToDelete.type === 'expense' && budget.month === txMonth) {
            const matchesCategory = budget.category.toLowerCase() === txToDelete.category.toLowerCase();
            const isAllBudget = budget.category === 'all';
            
            if (matchesCategory || isAllBudget) {
              return { ...budget, spent: Math.max(0, budget.spent - txToDelete.amount) };
            }
          }
          return budget;
        });

        set({
          transactions: transactions.filter((t) => t.id !== id),
          accounts: updatedAccounts,
          budgets: updatedBudgets,
        });
      },

      addAccount: (accData) => {
        const id = 'acc_' + Math.random().toString(36).substring(2, 9);
        const newAccount: Account = { ...accData, id };
        set((state) => ({ accounts: [...state.accounts, newAccount] }));
      },

      updateAccountBalance: (accountId, amount) => {
        set((state) => ({
          accounts: state.accounts.map((acc) => 
            acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc
          )
        }));
      },

      addBudget: (budgetData) => {
        const id = 'bud_' + Math.random().toString(36).substring(2, 9);
        const newBudget: Budget = { ...budgetData, id, spent: 0 };
        set((state) => ({ budgets: [...state.budgets, newBudget] }));
      },

      setSelectedAccountId: (id) => set({ selectedAccountId: id }),

      syncData: (data) => {
        set((state) => ({
          accounts: data.accounts || state.accounts,
          transactions: data.transactions || state.transactions,
          budgets: data.budgets || state.budgets,
          theme: data.theme || state.theme,
        }));
      },
    }),
    {
      name: 'coinburst-finance-storage',
      // Dynamic storage mechanism: falls back gracefully if window/localStorage is missing (like in Node SSR or React Native environment)
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        // In React Native, the bundle would override this storage with AsyncStorage:
        // import AsyncStorage from '@react-native-async-storage/async-storage';
        // storage: createJSONStorage(() => AsyncStorage)
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
