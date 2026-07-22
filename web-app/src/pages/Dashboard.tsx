import React, { useMemo, useEffect } from 'react';
import { useFinanceStore, formatCurrency } from '../../shared/useFinanceStore';
import { ResponsiveCalendar } from '@nivo/calendar';
import { ResponsiveSankey } from '@nivo/sankey';
import { TrendingUp, Trophy, Flame, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useThemeStyles } from '../components/DashboardWeb';

export const Dashboard: React.FC = () => {
  const { transactions, accounts, xp, level, streakDays, checkStreak, currency } = useFinanceStore();
  const cStyles = useThemeStyles();

  // Run streak check on mount
  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const fmt = (val: number) => formatCurrency(val, currency);

  // Gamification XP Progress
  const currentLevelXP = level * 1000;
  const xpPercentage = (xp / currentLevelXP) * 100;

  // Process data for Nivo Calendar (daily expenses)
  const calendarData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const daily: Record<string, number> = {};
    expenses.forEach(t => {
      const day = t.date.split('T')[0];
      daily[day] = (daily[day] || 0) + t.amount;
    });
    return Object.entries(daily).map(([day, value]) => ({ day, value }));
  }, [transactions]);

  // Process data for Sankey Diagram (Income -> Accounts -> Expenses)
  const sankeyData = useMemo(() => {
    const nodes = [{ id: 'Income', nodeColor: '#10B981' }];
    const links: any[] = [];
    
    // Add account nodes
    accounts.forEach(a => {
      nodes.push({ id: a.name, nodeColor: a.color });
    });
    
    // Aggregate income by account
    const incomes = transactions.filter(t => t.type === 'income');
    incomes.forEach(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      if (acc) {
        links.push({ source: 'Income', target: acc.name, value: t.amount });
      }
    });

    // Aggregate expenses by category and account
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories = new Set<string>();
    expenses.forEach(t => {
      categories.add(t.category);
      const acc = accounts.find(a => a.id === t.accountId);
      if (acc) {
        const link = links.find(l => l.source === acc.name && l.target === t.category);
        if (link) {
          link.value += t.amount;
        } else {
          links.push({ source: acc.name, target: t.category, value: t.amount });
        }
      }
    });

    categories.forEach(c => {
      nodes.push({ id: c, nodeColor: '#EF4444' });
    });

    // Fallback if data is empty to prevent Nivo crash
    if (links.length === 0) {
      return { nodes: [{ id: 'No Data' }, { id: 'Log Transactions' }], links: [{ source: 'No Data', target: 'Log Transactions', value: 1 }] };
    }

    return { nodes, links };
  }, [transactions, accounts]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-black">Workspace Ledger</span>
          <h2 className="text-3xl font-black tracking-tight mt-1">Financial Nexus</h2>
        </div>
        <div className={\`flex items-center gap-4 p-2 rounded-xl border \${cStyles.headerAccent}\`}>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block uppercase tracking-widest">Aggregate Net Worth</span>
            <span className="text-xl font-mono font-black text-emerald-400">
              {fmt(totalBalance)}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Gamification Bar */}
      <div className={\`p-6 rounded-2xl \${cStyles.cardBg} \${cStyles.shadow}\`}>
        <div className="flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Level</div>
              <div className="text-2xl font-black">Level {level}</div>
            </div>
          </div>
          
          <div className="flex-1 min-w-[250px]">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-emerald-400">{xp} XP</span>
              <span className="text-gray-500">{currentLevelXP} XP to Level {level + 1}</span>
            </div>
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: \`\${Math.max(5, xpPercentage)}%\` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            <div>
              <div className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest">Active Streak</div>
              <div className="text-lg font-black text-orange-500">{streakDays} Days</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Sankey Diagram */}
        <div className={\`p-6 rounded-2xl \${cStyles.cardBg} \${cStyles.shadow} h-[400px] flex flex-col\`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Cash Flow Topology
          </h3>
          <div className="flex-1 relative min-h-0">
            <ResponsiveSankey
              data={sankeyData}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              align="justify"
              colors={(node) => node.nodeColor || '#6366f1'}
              nodeOpacity={1}
              nodeThickness={18}
              nodeInnerPadding={3}
              nodeSpacing={24}
              nodeBorderWidth={0}
              linkOpacity={0.2}
              linkHoverOthersOpacity={0.1}
              linkContract={3}
              enableLinkGradient={true}
              labelPosition="inside"
              labelOrientation="horizontal"
              labelPadding={16}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.5]] }}
              theme={{
                labels: { text: { fontSize: 11, fontWeight: 'bold', fill: '#9CA3AF' } }
              }}
            />
          </div>
        </div>

        {/* Expense Heatmap */}
        <div className={\`p-6 rounded-2xl \${cStyles.cardBg} \${cStyles.shadow} h-[400px] flex flex-col\`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" /> Spending Heatmap
          </h3>
          <div className="flex-1 relative min-h-0 overflow-x-auto">
            <div className="min-w-[600px] h-full">
              <ResponsiveCalendar
                data={calendarData}
                from={new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]}
                to={new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]}
                emptyColor="#1e1e26"
                colors={['#10B981', '#F59E0B', '#EF4444', '#991B1B']}
                margin={{ top: 20, right: 20, bottom: 0, left: 40 }}
                yearSpacing={40}
                monthBorderColor="#0B0B0F"
                dayBorderWidth={2}
                dayBorderColor="#0B0B0F"
                theme={{
                  textColor: '#9CA3AF',
                  tooltip: { container: { background: '#000', color: '#fff', fontSize: '12px' } }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
