const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Add Imports
const imports = `
import { ResponsivePie } from '@nivo/pie';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Brush } from 'recharts';
import { PieChart, Calendar as CalendarIcon, Activity } from 'lucide-react';
`;
code = code.replace(/import \{ TrendingUp/, imports + 'import { TrendingUp');

// 2. Add Data Computation
const dataComputation = `
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  const pieData = [
    { id: 'Income', label: 'Income', value: totalIncome, color: '#10B981' },
    { id: 'Expense', label: 'Expense', value: totalExpense, color: '#EF4444' }
  ];

  const transactionDates = new Set(transactions.map(t => t.date.split('T')[0]));

  const chartData = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: t.type === 'income' ? t.amount : -t.amount,
  }));
  
  // Compute rolling balance
  let currentBalance = 0;
  const areaData = chartData.map(d => {
    currentBalance += d.amount;
    return { date: d.date, balance: currentBalance };
  });
`;
code = code.replace(/  \/\/ Gamification XP Progress/, dataComputation + '\n  // Gamification XP Progress');

// 3. Add UI Elements
const uiElements = `
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Income vs Expense Pie Chart */}
        <div className={\`p-6 rounded-2xl \${cStyles.cardBg} \${cStyles.shadow} h-[400px] flex flex-col\`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" /> Income vs Expense
          </h3>
          <div className="flex-1 relative min-h-0">
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.6}
              padAngle={2}
              cornerRadius={5}
              activeOuterRadiusOffset={8}
              colors={{ datum: 'data.color' }}
              borderWidth={0}
              enableArcLinkLabels={true}
              arcLinkLabelsTextColor="#9CA3AF"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#fff"
              theme={{
                tooltip: { container: { background: '#1e1e26', color: '#fff', fontSize: '13px', borderRadius: '8px' } }
              }}
            />
          </div>
        </div>

        {/* Transaction Calendar */}
        <div className={\`p-6 rounded-2xl \${cStyles.cardBg} \${cStyles.shadow} h-[400px] flex flex-col\`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" /> Activity Calendar
          </h3>
          <div className="flex-1 relative min-h-0 overflow-y-auto custom-calendar-wrapper">
            <Calendar 
              tileContent={({ date, view }) => {
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                if (view === 'month' && transactionDates.has(localDate)) {
                  return <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mt-1" />;
                }
                return null;
              }}
              className={\`w-full bg-transparent border-none text-white rounded-xl\`}
            />
          </div>
        </div>
        
        {/* Movable Analytics Graph */}
        <div className={\`p-6 rounded-2xl \${cStyles.cardBg} \${cStyles.shadow} h-[400px] flex flex-col lg:col-span-2\`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> Net Worth Timeline
          </h3>
          <div className="flex-1 relative min-h-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => '$'+val} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e1e26', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" />
                <Brush dataKey="date" height={30} stroke="#4b5563" fill="#1e1e26" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
`;
code = code.replace(/    <\/div>\n  \);\n\};\n/, uiElements + '    </div>\n  );\n};\n');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Dashboard features injected');
