import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';
import { getThemeColors } from '../theme/colors';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const { accounts, transactions, theme, currency } = useFinanceStore();
  const c = getThemeColors(theme);
  const fmt = (val: number) => formatCurrency(val, currency);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Pie data
  const pieData = [
    { name: 'Income', amount: totalIncome || 1, color: c.income, legendFontColor: c.textMuted, legendFontSize: 12 },
    { name: 'Expense', amount: totalExpense || 1, color: c.expense, legendFontColor: c.textMuted, legendFontSize: 12 },
  ];

  // Line chart data
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let balance = 0;
  const balanceData = sortedTxs.map(t => {
    balance += t.type === 'income' ? t.amount : -t.amount;
    return balance;
  });
  const labels = sortedTxs.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  // Calendar dots
  const transactionDayTypes = new Map<string, Set<string>>();
  transactions.forEach(t => {
    const day = t.date.split('T')[0];
    if (!transactionDayTypes.has(day)) transactionDayTypes.set(day, new Set());
    transactionDayTypes.get(day)!.add(t.type);
  });

  const recentDays = Array.from(transactionDayTypes.entries()).slice(-14);

  const chartConfig = {
    backgroundColor: c.card,
    backgroundGradientFrom: c.card,
    backgroundGradientTo: c.bg,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
    labelColor: () => c.textMuted,
    propsForDots: { r: '4', strokeWidth: '2', stroke: c.accent },
    propsForBackgroundLines: { stroke: c.cardBorder },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: c.textMuted }]}>WORKSPACE LEDGER</Text>
        <Text style={[styles.headerTitle, { color: c.text }]}>Financial Nexus</Text>
      </View>

      {/* Balance Card */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={[styles.cardLabel, { color: c.textMuted }]}>AGGREGATE NET WORTH</Text>
        <Text style={[styles.balanceText, { color: c.income }]}>{fmt(totalBalance)}</Text>
        <View style={styles.row}>
          <View style={[styles.statBadge, { backgroundColor: c.income + '20' }]}>
            <Text style={[styles.statLabel, { color: c.income }]}>↑ Income</Text>
            <Text style={[styles.statValue, { color: c.income }]}>{fmt(totalIncome)}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: c.expense + '20' }]}>
            <Text style={[styles.statLabel, { color: c.expense }]}>↓ Expense</Text>
            <Text style={[styles.statValue, { color: c.expense }]}>{fmt(totalExpense)}</Text>
          </View>
        </View>
      </View>

      {/* Pie Chart */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>📊 Income vs Expense</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 48}
          height={180}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="0"
          center={[0, 0]}
          hasLegend={true}
        />
      </View>

      {/* Activity Calendar */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>📅 Recent Activity</Text>
        <View style={styles.calendarGrid}>
          {recentDays.map(([day, types]) => {
            const hasIncome = types.has('income');
            const hasExpense = types.has('expense');
            const dotColor = hasIncome && hasExpense ? '#FFD700' : hasIncome ? c.income : c.expense;
            return (
              <View key={day} style={styles.calendarDay}>
                <View style={[styles.dot, { backgroundColor: dotColor, shadowColor: dotColor }]} />
                <Text style={[styles.dayText, { color: c.textMuted }]}>
                  {new Date(day + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            );
          })}
          {recentDays.length === 0 && <Text style={{ color: c.textMuted, fontSize: 12 }}>No activity yet</Text>}
        </View>
      </View>

      {/* Line Chart */}
      {balanceData.length > 1 && (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>📈 Net Worth Timeline</Text>
          <LineChart
            data={{
              labels: labels.length > 6 ? labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0) : labels,
              datasets: [{ data: balanceData.length > 0 ? balanceData : [0] }],
            }}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 12 }}
            withDots={balanceData.length <= 20}
            withInnerLines={true}
            withOuterLines={false}
          />
        </View>
      )}

      {/* Recent Transactions */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, marginBottom: 100 }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>🔄 Recent Transactions</Text>
        {transactions.slice(0, 5).map(tx => {
          const acc = accounts.find(a => a.id === tx.accountId);
          return (
            <View key={tx.id} style={[styles.txRow, { borderBottomColor: c.cardBorder }]}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'income' ? c.income + '20' : c.expense + '20' }]}>
                <Text style={{ fontSize: 16 }}>{tx.type === 'income' ? '↗' : '↘'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txDesc, { color: c.text }]}>{tx.description}</Text>
                <Text style={[styles.txCat, { color: c.textMuted }]}>{tx.category} {acc ? `• ${acc.name}` : ''}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'income' ? c.income : c.expense }]}>
                {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
              </Text>
            </View>
          );
        })}
        {transactions.length === 0 && <Text style={{ color: c.textMuted, textAlign: 'center', paddingVertical: 20 }}>No transactions yet</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 8 },
  headerLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  card: { borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 1 },
  cardLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  balanceText: { fontSize: 32, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statBadge: { flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 16 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  calendarDay: { alignItems: 'center', width: 48, paddingVertical: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4, elevation: 4 },
  dayText: { fontSize: 9, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txDesc: { fontSize: 14, fontWeight: '700' },
  txCat: { fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});

import { Platform } from 'react-native';
