import React, { useState } from 'react';
import { useFinanceStore, Transaction } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag, Calendar, Layers } from 'lucide-react';

// Dynamically import canvas-confetti to prevent server-side rendering issues
let confetti: any;
if (typeof window !== 'undefined') {
  confetti = require('canvas-confetti');
}

export const AddTransactionWeb: React.FC<{ 
  onClose: () => void;
  isOpen: boolean;
}> = ({ onClose, isOpen }) => {
  const cStyles = useThemeStyles();
  const accounts = useFinanceStore((state) => state.accounts);
  const addTransaction = useFinanceStore((state) => state.addTransaction);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const categories = [
    'Food', 'Entertainment', 'Salary', 'Rent', 'Shopping', 'Utilities', 'Travel'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !accountId) return;

    // Save transaction
    const newTx = addTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      date: new Date(date).toISOString(),
    });

    // 1. Trigger Confetti Burst (The Cha-Ching Interaction)
    if (confetti) {
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#00FF88', '#FF007F', '#00E5FF', '#FFE600'],
      });
    }

    // 2. Play Audio Cue (cha-ching.mp3)
    try {
      const audio = new Audio('/sounds/cha-ching.mp3');
      audio.volume = 0.6;
      audio.play().catch(err => console.log('Audio playback blocked or failed', err));
    } catch (err) {
      console.warn('Audio API is not available', err);
    }

    // Reset Form and close
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Form Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`relative z-10 w-full max-w-lg p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} overflow-hidden`}
          >
            {/* Glowing background circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00FF88]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FF007F]/5 rounded-full blur-3xl" />

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-black tracking-tight">Record Transaction</h3>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Income / Expense Toggle Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl mb-6 border border-gray-800/40 relative z-10">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  type === 'expense' 
                    ? 'bg-pink-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Capital Burn (Expense)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  type === 'income' 
                    ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Capital Harvest (Income)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Transaction Value</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full pl-11 pr-4 py-4 rounded-xl font-mono text-xl font-bold focus:outline-none transition-all duration-300 ${cStyles.input}`}
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sushi Dinner with partners"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 ${cStyles.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 appearance-none bg-no-repeat ${cStyles.input}`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-950 text-white">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Account Node Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Vault Node
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 appearance-none bg-no-repeat ${cStyles.input}`}
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="bg-gray-950 text-white">{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 ${cStyles.input}`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all duration-300 ${cStyles.primaryBtn}`}
              >
                Transmit to Ledger
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
