import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip } from 'recharts';
import { formatCurrency } from '../shared/useFinanceStore';
import type { Transaction } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';
import { ChevronLeft, ChevronRight, CalendarDays, PiggyBank, TrendingDown } from 'lucide-react';

interface CalendarChartColumnProps {
  transactions: Transaction[];
  currency: string;
}

export const CalendarChartColumn: React.FC<CalendarChartColumnProps> = ({ transactions, currency }) => {
  const cStyles = useThemeStyles();
  const fmt = (amount: number) => formatCurrency(amount, currency);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Selected day state (for transaction details)
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Helper: number of days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  // Helper: first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Generate days array
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDaysBefore = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Month name display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper: Get transaction totals for a specific day
  const getDayTotals = (day: number) => {
    const dayStart = new Date(year, month, day);
    const dayEnd = new Date(year, month, day, 23, 59, 59);

    const dayTx = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= dayStart && txDate <= dayEnd;
    });

    let income = 0;
    let expense = 0;
    dayTx.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });

    return { income, expense, txCount: dayTx.length, txs: dayTx };
  };

  // Monthly sums
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59);
  const monthTx = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= monthStart && txDate <= monthEnd;
  });

  let totalMonthIncome = 0;
  let totalMonthExpense = 0;
  monthTx.forEach((tx) => {
    if (tx.type === 'income') totalMonthIncome += tx.amount;
    else totalMonthExpense += tx.amount;
  });

  // Selected Day Details
  const selectedDayInfo = selectedDay ? getDayTotals(selectedDay) : null;

  // Pie chart data: Expenses vs. Savings
  // Savings is calculated as Income - Expenses (if positive)
  const savings = Math.max(0, totalMonthIncome - totalMonthExpense);
  const pieData = [
    { name: 'Expenses', value: totalMonthExpense },
    { name: 'Savings', value: savings || (totalMonthIncome === 0 ? 0 : totalMonthIncome) }
  ];

  // Pie colors: Expenses = Red/Coral (#E63946), Savings/Income = Teal/Emerald (#2A9D8F)
  const COLORS = ['#E63946', '#2A9D8F'];

  const monthYearLabel = `${monthNames[month]} ${year}`;

  return (
    <div className="space-y-6 w-full lg:max-w-md xl:max-w-lg shrink-0">
      {/* CARD 1: Monthly Calendar Grid */}
      <div className={`p-5 rounded-2xl border ${cStyles.cardBg} ${cStyles.shadow}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black tracking-wider uppercase flex items-center gap-2">
            <CalendarDays size={16} className={cStyles.accent} />
            Ledger Calendar
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg border border-transparent hover:border-gray-800 hover:bg-white/5 transition-colors cursor-pointer`}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black px-2 select-none">{monthYearLabel}</span>
            <button
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg border border-transparent hover:border-gray-800 hover:bg-white/5 transition-colors cursor-pointer`}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-gray-500 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDaysBefore.map((idx) => (
            <div key={`empty-${idx}`} className="h-10" />
          ))}

          {daysArray.map((day) => {
            const totals = getDayTotals(day);
            const isSelected = selectedDay === day;
            const hasActivity = totals.txCount > 0;

            // Determine day indicator outline or highlight
            let borderStyle = 'border-transparent';
            if (isSelected) {
              borderStyle = 'border-emerald-400 bg-emerald-400/10 scale-105';
            } else if (hasActivity) {
              borderStyle = 'border-gray-700 hover:border-gray-500 hover:bg-white/5';
            } else {
              borderStyle = 'hover:border-gray-800 hover:bg-white/5';
            }

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDay(day)}
                className={`h-10 rounded-xl border flex flex-col items-center justify-between py-1 transition-all cursor-pointer relative ${borderStyle}`}
              >
                <span className={`text-xs font-black ${isSelected ? 'text-white font-black' : ''}`}>
                  {day}
                </span>
                {/* Visual indicator dots */}
                <div className="flex gap-[2px] justify-center items-center h-1.5">
                  {totals.income > 0 && (
                    <span className="w-1 h-1 rounded-full bg-[#2A9D8F] shadow-[0_0_2px_#2A9D8F]" />
                  )}
                  {totals.expense > 0 && (
                    <span className="w-1 h-1 rounded-full bg-[#E63946] shadow-[0_0_2px_#E63946]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Summary Drawer */}
        {selectedDay && selectedDayInfo && (
          <div className="mt-4 pt-4 border-t border-gray-800/40 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-gray-400">
                Summary for {monthNames[month]} {selectedDay}
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                {selectedDayInfo.txCount} {selectedDayInfo.txCount === 1 ? 'Tx' : 'Txs'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2A9D8F]/10 flex items-center justify-center text-[#2A9D8F]">
                  <PiggyBank size={14} />
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block font-bold uppercase">Inflow</span>
                  <span className="text-xs font-mono font-black text-[#2A9D8F]">
                    {fmt(selectedDayInfo.income)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">
                  <TrendingDown size={14} />
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block font-bold uppercase">Outflow</span>
                  <span className="text-xs font-mono font-black text-[#E63946]">
                    {fmt(selectedDayInfo.expense)}
                  </span>
                </div>
              </div>
            </div>

            {/* List mini-feed */}
            {selectedDayInfo.txs.length > 0 && (
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                {selectedDayInfo.txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center text-[10px] p-1.5 rounded-lg bg-white/5 border border-white/5"
                  >
                    <span className="font-bold truncate max-w-[120px]">{tx.description}</span>
                    <span
                      className={`font-mono font-black ${
                        tx.type === 'income' ? 'text-[#2A9D8F]' : 'text-[#E63946]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CARD 2: opposite-coloured pie chart */}
      <div className={`p-5 rounded-2xl border ${cStyles.cardBg} ${cStyles.shadow} flex flex-col h-[280px]`}>
        <h3 className="text-sm font-black tracking-wider uppercase flex items-center gap-2 mb-3">
          <PiggyBank size={16} className={cStyles.accent} />
          Inflow vs Outflow Proportion
        </h3>

        {totalMonthIncome === 0 && totalMonthExpense === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-gray-500">
            <span className="font-bold uppercase tracking-widest text-[10px] mb-1">No Ledger Nodes Recorded</span>
            <p>Add transactions this month to plot visual flows.</p>
          </div>
        ) : (
          <div className="flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  formatter={(value: any) => [fmt(Number(value || 0)), '']}
                  contentStyle={{
                    backgroundColor: '#0B0B0F',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-[10px] text-gray-400 uppercase font-black">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Net Savings Center Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Net Flow</span>
              <span className={`text-xs font-mono font-black ${totalMonthIncome - totalMonthExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalMonthIncome - totalMonthExpense >= 0 ? '+' : ''}{fmt(totalMonthIncome - totalMonthExpense)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
