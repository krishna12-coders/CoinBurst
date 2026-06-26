import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { database } from './firebase';
import { ref, set as firebaseSet, get as firebaseGet, update as firebaseUpdate } from 'firebase/database';

export type ThemeType = 'dark' | 'light' | 'cyberpunk' | 'glass' | 'forest';

// ── Currency definitions ──────────────────────────────────────────────────────
export interface CurrencyDefinition {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyDefinition[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee',        locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar',            locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro',                 locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound',        locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen',         locale: 'ja-JP' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',         locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',    locale: 'en-SG' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',     locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',   locale: 'en-AU' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',         locale: 'de-CH' },
];

/** Formats a number as a currency string using the stored currency code */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const def = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) ?? SUPPORTED_CURRENCIES[0];
  // JPY has no decimal places
  const decimals = currencyCode === 'JPY' ? 0 : 2;
  return `${def.symbol}${Math.abs(amount).toLocaleString(def.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

// ── Interfaces ────────────────────────────────────────────────────────────────
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
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

interface FinanceState {
  theme: ThemeType;
  currency: string; // ISO 4217 code e.g. 'INR'
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  selectedAccountId: string | null;
  user: UserProfile | null;
  loading: boolean;

  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemeType) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  updateAccountBalance: (accountId: string, amount: number) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  deleteBudget: (id: string) => void;
  setSelectedAccountId: (id: string | null) => void;
  syncData: (data: {
    accounts?: Account[];
    transactions?: Transaction[];
    budgets?: Budget[];
    theme?: ThemeType;
    currency?: string;
  }) => void;
  setUser: (user: UserProfile | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const getCurrentMonthString = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}`;
};

// Firebase RTDB silently drops empty arrays — convert [] to null so the key is preserved
const toFirebaseArray = <T>(arr: T[]): T[] | null => arr.length > 0 ? arr : null;

// Convert Firebase null back to an empty array
const fromFirebaseArray = <T>(val: unknown): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  // Firebase sometimes stores arrays as objects keyed by index — convert them back
  if (typeof val === 'object') return Object.values(val) as T[];
  return [];
};

// Save full ledger state to Firebase under the user's node
const saveStateToFirebase = (
  uid: string,
  accounts: Account[],
  transactions: Transaction[],
  budgets: Budget[],
  theme: ThemeType,
  currency: string
) => {
  const dbRef = ref(database, `users/${uid}`);
  const payload: Record<string, unknown> = {
    theme,
    currency,
    accounts: toFirebaseArray(accounts),
    transactions: toFirebaseArray(transactions),
    budgets: toFirebaseArray(budgets),
  };
  firebaseUpdate(dbRef, payload)
    .catch(err => console.error('[CoinBurst] Firebase sync failed:', err));
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      currency: 'INR',  // Default currency = Indian Rupee
      accounts: [],
      transactions: [],
      budgets: [],
      selectedAccountId: null,
      user: null,
      loading: false,

      // ── Currency ──────────────────────────────────────────────────────────────
      setCurrency: (currency) => {
        set({ currency });
        const { user, accounts, transactions, budgets, theme } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, budgets, theme, currency);
      },

      // ── Theme ──────────────────────────────────────────────────────────────
      setTheme: (theme) => {
        set({ theme });
        const { user, accounts, transactions, budgets, currency } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, budgets, theme, currency);
      },

      // ── Transactions ────────────────────────────────────────────────────────
      addTransaction: (txData) => {
        const id = 'tx_' + Math.random().toString(36).substring(2, 9);
        const newTransaction: Transaction = { ...txData, id };
        const txMonth = getCurrentMonthString(newTransaction.date);
        const amountChange = newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;
        const { accounts, budgets, transactions, theme, currency } = get();

        const updatedAccounts = accounts.map((acc) =>
          acc.id === newTransaction.accountId
            ? { ...acc, balance: acc.balance + amountChange }
            : acc
        );

        const updatedBudgets = budgets.map((budget) => {
          if (newTransaction.type === 'expense' && budget.month === txMonth) {
            const matchesCategory =
              budget.category.toLowerCase() === newTransaction.category.toLowerCase();
            const isAllBudget = budget.category === 'all';
            if (matchesCategory || isAllBudget) {
              return { ...budget, spent: budget.spent + newTransaction.amount };
            }
          }
          return budget;
        });

        const updatedTransactions = [newTransaction, ...transactions];
        set({ transactions: updatedTransactions, accounts: updatedAccounts, budgets: updatedBudgets });

        const { user } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);

        return newTransaction;
      },

      deleteTransaction: (id) => {
        const { transactions, accounts, budgets, theme, currency } = get();
        const txToDelete = transactions.find((t) => t.id === id);
        if (!txToDelete) return;

        const txMonth = getCurrentMonthString(txToDelete.date);
        const amountChange = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;

        const updatedAccounts = accounts.map((acc) =>
          acc.id === txToDelete.accountId
            ? { ...acc, balance: acc.balance + amountChange }
            : acc
        );

        const updatedBudgets = budgets.map((budget) => {
          if (txToDelete.type === 'expense' && budget.month === txMonth) {
            const matchesCategory =
              budget.category.toLowerCase() === txToDelete.category.toLowerCase();
            const isAllBudget = budget.category === 'all';
            if (matchesCategory || isAllBudget) {
              return { ...budget, spent: Math.max(0, budget.spent - txToDelete.amount) };
            }
          }
          return budget;
        });

        const updatedTransactions = transactions.filter((t) => t.id !== id);
        set({ transactions: updatedTransactions, accounts: updatedAccounts, budgets: updatedBudgets });

        const { user } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);
      },

      // ── Accounts ─────────────────────────────────────────────────────────────
      addAccount: (accData) => {
        const id = 'acc_' + Math.random().toString(36).substring(2, 9);
        const newAccount: Account = { ...accData, id };
        const updatedAccounts = [...get().accounts, newAccount];
        set({ accounts: updatedAccounts });

        const { user, transactions, budgets, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, transactions, budgets, theme, currency);
      },

      deleteAccount: (id) => {
        const { transactions, budgets, theme, currency } = get();
        const updatedAccounts = get().accounts.filter((a) => a.id !== id);
        const updatedTransactions = transactions.filter((t) => t.accountId !== id);
        set({ accounts: updatedAccounts, transactions: updatedTransactions, selectedAccountId: null });

        const { user } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, budgets, theme, currency);
      },

      updateAccountBalance: (accountId, amount) => {
        const updatedAccounts = get().accounts.map((acc) =>
          acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc
        );
        set({ accounts: updatedAccounts });

        const { user, transactions, budgets, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, transactions, budgets, theme, currency);
      },

      // ── Budgets ──────────────────────────────────────────────────────────────
      addBudget: (budgetData) => {
        const id = 'bud_' + Math.random().toString(36).substring(2, 9);
        const newBudget: Budget = { ...budgetData, id, spent: 0 };
        const updatedBudgets = [...get().budgets, newBudget];
        set({ budgets: updatedBudgets });

        const { user, accounts, transactions, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, updatedBudgets, theme, currency);
      },

      deleteBudget: (id) => {
        const updatedBudgets = get().budgets.filter((b) => b.id !== id);
        set({ budgets: updatedBudgets });

        const { user, accounts, transactions, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, updatedBudgets, theme, currency);
      },

      // ── Selection ─────────────────────────────────────────────────────────────
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),

      syncData: (data) => {
        set((state) => ({
          accounts: data.accounts ?? state.accounts,
          transactions: data.transactions ?? state.transactions,
          budgets: data.budgets ?? state.budgets,
          theme: data.theme ?? state.theme,
          currency: data.currency ?? state.currency,
        }));
      },

      // ── Auth / Firebase Load ──────────────────────────────────────────────────
      setUser: async (user) => {
        if (user) {
          set({ user, loading: true });
          const dbRef = ref(database, `users/${user.uid}`);
          try {
            const snapshot = await firebaseGet(dbRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              // Merge profile data from Firebase with the auth user
              const loadedUser = { ...user };
              if (data.profile) {
                loadedUser.displayName = data.profile.displayName || user.displayName;
                loadedUser.photoURL = data.profile.photoURL || user.photoURL;
              }
              set({
                user: loadedUser,
                accounts: fromFirebaseArray<Account>(data.accounts),
                transactions: fromFirebaseArray<Transaction>(data.transactions),
                budgets: fromFirebaseArray<Budget>(data.budgets),
                theme: (data.theme as ThemeType) || 'dark',
                currency: data.currency || 'INR',
              });
              console.log('[CoinBurst] Loaded user data from Firebase.');
            } else {
              // First ever login — initialise a fresh record in Firebase
              const freshProfile = {
                displayName: user.displayName,
                photoURL: user.photoURL || '',
                email: user.email,
              };
              await firebaseSet(dbRef, {
                theme: 'dark',
                currency: 'INR',
                profile: freshProfile,
                // Don't write accounts/transactions/budgets — Firebase drops empty arrays
              });
              set({
                user,
                accounts: [],
                transactions: [],
                budgets: [],
                theme: 'dark',
                currency: 'INR',
              });
              console.log('[CoinBurst] New user record created in Firebase.');
            }
          } catch (error) {
            console.error('[CoinBurst] Firebase load failed:', error);
          } finally {
            set({ loading: false });
          }
        } else {
          // Sign-out: clear everything from the local store
          set({
            user: null,
            accounts: [],
            transactions: [],
            budgets: [],
            selectedAccountId: null,
            loading: false,
            currency: 'INR',
          });
        }
      },

      setLoading: (loading) => set({ loading }),

      // ── Profile Update ────────────────────────────────────────────────────────
      updateUserProfile: async (profile) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, ...profile };
        set({ user: updatedUser });

        const dbRef = ref(database, `users/${user.uid}/profile`);
        try {
          await firebaseUpdate(dbRef, {
            displayName: updatedUser.displayName,
            photoURL: updatedUser.photoURL || '',
            email: updatedUser.email,
          });
        } catch (error) {
          console.error('Firebase profile update failed:', error);
        }
      },
    }),
    {
      name: 'coinburst-v2-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist theme and currency preference; ledger data always comes from Firebase
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
      }),
    }
  )
);
