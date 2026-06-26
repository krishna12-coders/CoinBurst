import React, { useState } from 'react';
import { useFinanceStore, ThemeType, Transaction, Account } from '../shared/useFinanceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight, Settings, 
  TrendingUp, CreditCard, PiggyBank, BarChart3, User, LogOut, ChevronRight
} from 'lucide-react';

// --- Theme Helper Hooks ---
export const useThemeStyles = () => {
  const theme = useFinanceStore((state) => state.theme);
  
  const styles = {
    dark: {
      bg: 'bg-[#000000] text-[#FFFFFF]',
      cardBg: 'bg-[#0B0B0F] border border-[#1E1E26]',
      textMuted: 'text-[#9CA3AF]',
      accent: 'text-[#00FF88]',
      accentBg: 'bg-[#00FF88]/10',
      accentPink: 'text-[#FF007F]',
      primaryBtn: 'bg-[#00FF88] text-[#000000] hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]',
      primaryBtnOutline: 'border border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88]/10',
      input: 'bg-[#0B0B0F] border border-[#1E1E26] focus:border-[#00FF88] text-white',
      shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.8)]',
      gradientBorder: 'hover:border-[#00FF88]/50 transition-all duration-300',
      navActive: 'bg-[#00FF88]/10 text-[#00FF88] border-r-4 border-[#00FF88]',
      navInactive: 'text-[#9CA3AF] hover:text-white hover:bg-white/5',
      chartColors: ['#00FF88', '#00E5FF', '#FF007F', '#A855F7'],
      gridColor: '#1E1E26'
    },
    light: {
      bg: 'bg-[#F3F4F6] text-[#1F2937]',
      cardBg: 'bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm',
      textMuted: 'text-[#6B7280]',
      accent: 'text-[#10B981]',
      accentBg: 'bg-[#10B981]/10',
      accentPink: 'text-[#F43F5E]',
      primaryBtn: 'bg-[#10B981] text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]',
      primaryBtnOutline: 'border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10',
      input: 'bg-white border border-[#D1D5DB] focus:border-[#10B981] text-gray-900',
      shadow: 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
      gradientBorder: 'hover:border-[#10B981]/50 transition-all duration-300',
      navActive: 'bg-[#10B981]/10 text-[#10B981] border-r-4 border-[#10B981]',
      navInactive: 'text-[#6B7280] hover:text-gray-900 hover:bg-gray-100',
      chartColors: ['#10B981', '#3B82F6', '#F43F5E', '#8B5CF6'],
      gridColor: '#E5E7EB'
    },
    cyberpunk: {
      bg: 'bg-[#12042C] text-[#FFE600]',
      cardBg: 'bg-[#1F0E3D] border-2 border-[#FF007F] shadow-[0_0_15px_rgba(255,0,127,0.2)]',
      textMuted: 'text-[#A8A29E] text-opacity-90',
      accent: 'text-[#FFE600]',
      accentBg: 'bg-[#FFE600]/10',
      accentPink: 'text-[#FF007F]',
      primaryBtn: 'bg-[#FFE600] text-[#12042C] font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(255,230,0,0.6)] border-2 border-[#FFE600]',
      primaryBtnOutline: 'border-2 border-[#FF007F] text-[#FF007F] hover:bg-[#FF007F]/15 font-bold uppercase tracking-wider',
      input: 'bg-[#12042C] border-2 border-[#FF007F] focus:border-[#FFE600] text-[#FFE600] font-mono',
      shadow: 'shadow-[0_0_25px_rgba(255,0,127,0.35)]',
      gradientBorder: 'hover:border-[#FFE600] hover:shadow-[0_0_20px_rgba(255,0,127,0.5)] transition-all duration-300',
      navActive: 'bg-[#FF007F]/20 text-[#FFE600] border-r-4 border-[#FFE600] shadow-[inset_0_0_10px_rgba(255,0,127,0.3)]',
      navInactive: 'text-[#FF007F] hover:text-[#FFE600] hover:bg-[#FF007F]/10',
      chartColors: ['#FFE600', '#FF007F', '#39FF14', '#00E5FF'],
      gridColor: '#FF007F/30'
    }
  };
  
  return styles[theme] || styles.dark;
};

// --- Liquid SVG Progress Bar Component ---
export const LiquidProgressBar: React.FC<{ spent: number; limit: number }> = ({ spent, limit }) => {
  const cStyles = useThemeStyles();
  const percentage = Math.min(100, Math.max(0, (spent / limit) * 100));
  
  // Calculate dynamic color based on spending thresholds
  // Green -> Yellow -> Neon Red
  let fillColor = '#10B981'; // Green (default)
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  if (percentage >= 100) {
    fillColor = '#EF4444'; // Neon Red
    glowColor = 'rgba(239, 68, 68, 0.6)';
  } else if (percentage >= 80) {
    fillColor = '#F59E0B'; // Yellow
    glowColor = 'rgba(245, 158, 11, 0.5)';
  }

  // Wave y-coordinate calculation (SVG coordinates: 0 is top, 100 is bottom)
  // When percentage is 0%, wave is at 100 (bottom)
  // When percentage is 100%, wave is at 10 (top)
  const waveY = 100 - (percentage * 0.9);

  return (
    <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-gray-700/50 flex items-center justify-center bg-gray-900/40 shadow-inner">
      {/* Animated Liquid Wave */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
      >
        <motion.path
          d={`M 0,${waveY} Q 25,${waveY - 6} 50,${waveY} T 100,${waveY} L 100,100 L 0,100 Z`}
          fill={fillColor}
          animate={{
            d: [
              `M 0,${waveY} Q 25,${waveY - 6} 50,${waveY} T 100,${waveY} L 100,100 L 0,100 Z`,
              `M 0,${waveY} Q 25,${waveY + 6} 50,${waveY} T 100,${waveY} L 100,100 L 0,100 Z`,
              `M 0,${waveY} Q 25,${waveY - 6} 50,${waveY} T 100,${waveY} L 100,100 L 0,100 Z`
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        />
      </svg>
      
      {/* Text overlay */}
      <div className="relative z-10 text-center select-none">
        <span className="text-3xl font-black text-white font-mono">
          {percentage.toFixed(0)}%
        </span>
        <div className="text-[10px] text-gray-200 uppercase tracking-widest font-bold drop-shadow-md">
          Spent
        </div>
        <div className="text-[11px] text-white/80 font-mono mt-1">
          ${spent.toFixed(0)} / ${limit.toFixed(0)}
        </div>
      </div>
    </div>
  );
};

// --- Main Multipage Dashboard Web Component ---
export const DashboardWeb: React.FC<{ 
  onNavigate: (page: 'dashboard' | 'transactions' | 'budgets' | 'settings') => void;
  activePage: 'dashboard' | 'transactions' | 'budgets' | 'settings';
}> = ({ onNavigate, activePage }) => {
  const cStyles = useThemeStyles();
  const theme = useFinanceStore((state) => state.theme);
  const setTheme = useFinanceStore((state) => state.setTheme);
  
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const budgets = useFinanceStore((state) => state.budgets);
  const selectedAccountId = useFinanceStore((state) => state.selectedAccountId);
  const setSelectedAccountId = useFinanceStore((state) => state.setSelectedAccountId);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  // Filter accounts and transactions
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const filteredTransactions = selectedAccountId 
    ? transactions.filter(t => t.accountId === selectedAccountId)
    : transactions;

  // Calculate Net Worth / Summary
  const totalBalance = accounts.reduce((acc, curr) => {
    return curr.type === 'credit' ? acc + curr.balance : acc + curr.balance;
  }, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Chart data formatting
  const chartData = filteredTransactions.slice().reverse().map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: t.amount,
    type: t.type,
    // Cumulative logic simulation
    balance: t.type === 'income' ? t.amount : -t.amount
  }));

  // Budget summary for category progress display
  const overallBudget = budgets.find(b => b.category === 'all') || { spent: 0, limit: 1 };

  return (
    <div className={`min-h-screen ${cStyles.bg} font-sans transition-colors duration-500 flex`}>
      
      {/* 1. Multipage Navigation Sidebar */}
      <aside className={`w-64 border-r ${theme === 'cyberpunk' ? 'border-[#FF007F]' : 'border-gray-800'} flex flex-col justify-between ${cStyles.cardBg}`}>
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-gray-800/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[2px] animate-pulse">
              <div className="w-full h-full bg-[#0B0B0F] rounded-xl flex items-center justify-center">
                <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">CB</span>
              </div>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-[#9CA3AF] to-white">COINBURST</h1>
              <span className="text-[9px] tracking-widest text-emerald-400 font-bold uppercase">Wealth Hub</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'transactions', label: 'Ledger & Entry', icon: Wallet },
              { id: 'budgets', label: 'Smart Budgets', icon: PiggyBank },
              { id: 'settings', label: 'System Theme', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isActive ? cStyles.navActive : cStyles.navInactive
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-gray-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black shadow-md">
            PP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">Parth Pawar</p>
            <p className="text-[10px] text-gray-400 truncate">VIP Wealth Builder</p>
          </div>
          <button className="text-gray-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Header Banner */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-black">Workspace Ledger</span>
            <h2 className="text-3xl font-black tracking-tight mt-1">
              {activePage === 'dashboard' && 'Financial Nexus'}
              {activePage === 'transactions' && 'Vault Transaction Ledger'}
              {activePage === 'budgets' && 'Dynamic Limit Enforcers'}
              {activePage === 'settings' && 'System Parameters'}
            </h2>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-gray-800/40">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block uppercase tracking-widest">Aggregate Net Worth</span>
              <span className="text-xl font-mono font-black text-emerald-400">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* PAGE RENDER SWITCH */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {activePage === 'dashboard' && (
              <div className="space-y-8">
                
                {/* 1. Account Picker Banner & Cards */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold tracking-wide">Multi-Wallet Sync Status</h3>
                    <button 
                      onClick={() => onNavigate('settings')}
                      className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Manage Accounts <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Account Selector Pills */}
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-800">
                    <button
                      onClick={() => setSelectedAccountId(null)}
                      className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 border ${
                        selectedAccountId === null 
                          ? 'bg-white text-black border-white' 
                          : 'bg-black/40 text-gray-400 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      All Wallets
                    </button>
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 border flex items-center gap-2 ${
                          selectedAccountId === acc.id 
                            ? 'bg-opacity-100 text-white shadow-lg' 
                            : 'bg-black/40 text-gray-400 border-gray-800 hover:border-gray-600'
                        }`}
                        style={{ 
                          backgroundColor: selectedAccountId === acc.id ? acc.color : undefined,
                          borderColor: acc.color 
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        {acc.name} (${acc.balance})
                      </button>
                    ))}
                  </div>

                  {/* Glassmorphic Account Details Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                    {/* Primary Balance Display Card */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ledger Focus Balance</p>
                          <h4 className="text-3xl font-black font-mono mt-2 tracking-tight">
                            ${(selectedAccount ? selectedAccount.balance : totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </h4>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-[#00FF88]">
                          <Wallet className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
                        </span>
                        <span>vs last billing cycle</span>
                      </div>
                    </motion.div>

                    {/* Active Income Flow Card */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Inbound Capital (Income)</p>
                          <h4 className="text-3xl font-black font-mono mt-2 tracking-tight text-emerald-400">
                            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </h4>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                          <ArrowUpRight className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <span>Across {filteredTransactions.filter(t => t.type === 'income').length} deposits</span>
                      </div>
                    </motion.div>

                    {/* Active Expense Burn Card */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Outbound Burn (Expenses)</p>
                          <h4 className="text-3xl font-black font-mono mt-2 tracking-tight text-pink-500">
                            -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </h4>
                        </div>
                        <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                          <ArrowDownRight className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <span>Across {filteredTransactions.filter(t => t.type === 'expense').length} burns</span>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* 2. Charts and Liquid Progress Indicators */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Ledger Analytics Plot */}
                  <div className={`lg:col-span-2 p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-black tracking-wide">Liquidity Trend Analysis</h3>
                        <p className="text-xs text-gray-400">Visual mapping of transactions</p>
                      </div>
                    </div>
                    
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={cStyles.chartColors[0]} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={cStyles.chartColors[0]} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={cStyles.gridColor} />
                          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                          <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0B0B0F', 
                              borderColor: '#1E1E26',
                              color: '#fff',
                              borderRadius: '12px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke={cStyles.chartColors[0]} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Visual Gamified Budget Milestones (Liquid Progress) */}
                  <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} flex flex-col justify-between items-center`}>
                    <div className="text-center w-full">
                      <h3 className="text-lg font-black tracking-wide">Overall Budget Sentinel</h3>
                      <p className="text-xs text-gray-400 mb-6">Aggregate spending threshold cap</p>
                    </div>

                    {/* Dynamic Liquid Wave */}
                    <LiquidProgressBar spent={overallBudget.spent} limit={overallBudget.limit} />

                    <div className="mt-6 text-center w-full space-y-2">
                      <div className="flex justify-between text-xs font-semibold px-4 text-gray-400">
                        <span>Total Limit</span>
                        <span className="font-mono text-white font-bold">${overallBudget.limit}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold px-4 text-gray-400">
                        <span>Current Burn</span>
                        <span className="font-mono text-pink-500 font-bold">${overallBudget.spent}</span>
                      </div>
                      <button 
                        onClick={() => onNavigate('budgets')}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all duration-300 ${cStyles.primaryBtn}`}
                      >
                        Adjust Thresholds
                      </button>
                    </div>
                  </div>
                </section>

                {/* 3. Transaction Feed */}
                <section className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-black tracking-wide">Activity Ledger Feed</h3>
                      <p className="text-xs text-gray-400">Real-time audit log of multi-wallet operations</p>
                    </div>
                    <button 
                      onClick={() => onNavigate('transactions')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${cStyles.primaryBtn}`}
                    >
                      <Plus className="w-4 h-4" /> Add Transaction
                    </button>
                  </div>

                  {/* Ledger Feed Container */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm font-semibold">
                          No transactions tracked for this scope.
                        </div>
                      ) : (
                        filteredTransactions.map((tx) => {
                          const acc = accounts.find(a => a.id === tx.accountId);
                          return (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/40 border border-gray-800/40 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${
                                  tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-pink-500/10 text-pink-500'
                                }`}>
                                  {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm">{tx.description}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 uppercase tracking-widest font-bold">
                                      {tx.category}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">
                                      {new Date(tx.date).toLocaleDateString()}
                                    </span>
                                    {acc && (
                                      <span 
                                        className="text-[10px] font-bold uppercase tracking-wider"
                                        style={{ color: acc.color }}
                                      >
                                        • {acc.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className={`text-sm font-black font-mono ${
                                  tx.type === 'income' ? 'text-emerald-400' : 'text-pink-500'
                                }`}>
                                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => deleteTransaction(tx.id)}
                                  className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              </div>
            )}

            {/* Other page outlines will be linked for Multipage navigation */}
            {activePage === 'transactions' && (
              <div className="text-center py-16">
                <p className="text-lg font-bold">Transactions Ledger & Addition Form Router</p>
                <p className="text-xs text-gray-400 mt-2">See below component for the interactive form implementation.</p>
                <button 
                  onClick={() => onNavigate('dashboard')} 
                  className={`mt-6 px-6 py-2.5 rounded-xl text-sm font-bold ${cStyles.primaryBtn}`}
                >
                  Return to Nexus Dashboard
                </button>
              </div>
            )}

            {activePage === 'budgets' && (
              <div className="space-y-8">
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <h3 className="text-lg font-black tracking-wide mb-6">Gamified Category Budgets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                    {budgets.map(b => (
                      <div key={b.id} className="flex flex-col items-center p-4 bg-black/10 rounded-2xl border border-gray-800/40 w-full max-w-xs">
                        <span className="text-sm font-black uppercase tracking-wider mb-4 text-center">{b.category} Cap</span>
                        <LiquidProgressBar spent={b.spent} limit={b.limit} />
                        <span className="text-[11px] text-gray-400 font-mono mt-4">Threshold: {b.spent >= b.limit ? 'BREACHED' : b.spent >= b.limit * 0.8 ? 'WARNING' : 'STABLE'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activePage === 'settings' && (
              <div className="space-y-8">
                {/* Dynamic Theme Switcher Section */}
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <h3 className="text-lg font-black tracking-wide mb-2">Dynamic Theme Switcher</h3>
                  <p className="text-xs text-gray-400 mb-6">Instantly swap the global user interface aesthetic.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'dark', title: 'True Dark Mode', desc: 'Pure AMOLED Black, deep space card fills, neon glowing accents.' },
                      { id: 'light', title: 'Soft Light Mode', desc: 'Minimal pastel palettes, subtle drop-shadows.' },
                      { id: 'cyberpunk', title: 'Cyberpunk/Retro', desc: 'High-contrast yellow, magenta, and dark purple styling.' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as ThemeType)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                          theme === t.id 
                            ? 'border-[#00FF88] bg-[#00FF88]/5 shadow-lg shadow-[#00FF88]/10' 
                            : 'border-gray-800 hover:border-gray-700 bg-black/20'
                        }`}
                      >
                        <h4 className="font-bold text-sm mb-2">{t.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
