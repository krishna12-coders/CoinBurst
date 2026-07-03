import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Dimensions, 
  StyleSheet, Pressable 
} from 'react-native';
import { useFinanceStore, SUPPORTED_CURRENCIES, formatCurrency } from '../shared/useFinanceStore';
import type { Transaction, Account } from '../shared/useFinanceStore';
import Animated, { 
  useSharedValue, useAnimatedStyle, withSpring, withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { 
  GestureHandlerRootView, PanGestureHandler, 
  PanGestureHandlerGestureEvent 
} from 'react-native-gesture-handler';
import Svg, { Path, Circle, Defs, ClipPath, Rect } from 'react-native-svg';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, Trash2, 
  Plus, Settings, BarChart3, PiggyBank, Wallet 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- Dynamic Color Configurations for Native ---
const getThemeColors = (theme: 'dark' | 'light' | 'cyberpunk') => {
  const schemes = {
    dark: {
      bg: '#000000',
      cardBg: '#0B0B0F',
      cardBorder: '#1E1E26',
      text: '#FFFFFF',
      textMuted: '#9CA3AF',
      accent: '#00FF88',
      accentPink: '#FF007F',
      accentCyan: '#00E5FF'
    },
    light: {
      bg: '#F3F4F6',
      cardBg: '#FFFFFF',
      cardBorder: '#E5E7EB',
      text: '#1F2937',
      textMuted: '#6B7280',
      accent: '#10B981',
      accentPink: '#F43F5E',
      accentCyan: '#3B82F6'
    },
    cyberpunk: {
      bg: '#12042C',
      cardBg: '#1F0E3D',
      cardBorder: '#FF007F',
      text: '#FFE600',
      textMuted: '#A8A29E',
      accent: '#FFE600',
      accentPink: '#FF007F',
      accentCyan: '#00E5FF'
    }
  };
  return schemes[theme] || schemes.dark;
};

// --- Custom Reanimated 3 Liquid Progress Bar for Mobile ---
export const MobileLiquidProgressBar: React.FC<{ spent: number; limit: number }> = ({ spent, limit }) => {
  const theme = useFinanceStore((state) => state.theme);
  const currency = useFinanceStore((state) => state.currency);
  const def = SUPPORTED_CURRENCIES.find(c => c.code === currency) ?? SUPPORTED_CURRENCIES[0];
  const colors = getThemeColors(theme);
  const percentage = Math.min(100, Math.max(0, (spent / limit) * 100));

  // Determine indicator colors
  let fillColor = '#10B981'; 
  if (percentage >= 100) fillColor = '#EF4444';
  else if (percentage >= 80) fillColor = '#F59E0B';

  const waveY = 100 - (percentage * 0.9);

  return (
    <View style={styles.liquidContainer}>
      <Svg height="150" width="150" viewBox="0 0 100 100">
        <Defs>
          <ClipPath id="clip">
            <Circle cx="50" cy="50" r="46" />
          </ClipPath>
        </Defs>
        
        {/* Background Circle */}
        <Circle cx="50" cy="50" r="48" fill="#111827" stroke={colors.cardBorder} strokeWidth="3" />
        
        {/* Clip Path containing the morphing wave */}
        <Path
          d={`M 0,${waveY} Q 25,${waveY - 6} 50,${waveY} T 100,${waveY} L 100,100 L 0,100 Z`}
          fill={fillColor}
          clipPath="url(#clip)"
        />
        
        {/* Inner Border */}
        <Circle cx="50" cy="50" r="46" fill="none" stroke={colors.cardBorder} strokeWidth="1" />
      </Svg>

      {/* Overlay Text */}
      <View style={styles.liquidTextContainer}>
        <Text style={[styles.liquidPercentageText, { color: '#FFFFFF' }]}>
          {percentage.toFixed(0)}%
        </Text>
        <Text style={styles.liquidLabelText}>SPENT</Text>
        <Text style={styles.liquidSubText}>
          {def.symbol}{spent.toFixed(0)}/{def.symbol}{limit.toFixed(0)}
        </Text>
      </View>
    </View>
  );
};

// --- Gesture-Based Swipe to Delete Item ---
interface SwipeableItemProps {
  transaction: Transaction;
  accountColor: string;
  accountName: string;
  onDelete: (id: string) => void;
  colors: ReturnType<typeof getThemeColors>;
}

const SWIPE_THRESHOLD = -80;

const SwipeableTransactionItem: React.FC<SwipeableItemProps> = ({ 
  transaction, accountColor, accountName, onDelete, colors 
}) => {
  const currency = useFinanceStore((state) => state.currency);
  const fmt = (amount: number) => formatCurrency(amount, currency);
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(76);
  const opacity = useSharedValue(1);

  const panGestureHandler = (event: PanGestureHandlerGestureEvent) => {
    // Only allow swipe left (negative translation)
    if (event.nativeEvent.translationX < 0) {
      translateX.value = event.nativeEvent.translationX;
    }
  };

  const onGestureEnd = () => {
    if (translateX.value < SWIPE_THRESHOLD) {
      // Trigger spring deletion sequence
      translateX.value = withSpring(-width);
      itemHeight.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, (isFinished) => {
        if (isFinished) {
          runOnJS(onDelete)(transaction.id);
        }
      });
    } else {
      translateX.value = withSpring(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: opacity.value,
    marginBottom: itemHeight.value === 0 ? 0 : 12
  }));

  return (
    <Animated.View style={[styles.swipeContainer, animatedContainerStyle]}>
      {/* Behind/Underlay Delete Action Trash Can */}
      <View style={[styles.deleteUnderlay, { backgroundColor: '#EF4444' }]}>
        <View style={styles.trashBinContainer}>
          <Trash2 size={24} color="#FFFFFF" />
        </View>
      </View>

      {/* Main Swipeable Foreground Card */}
      <PanGestureHandler
        onGestureEvent={panGestureHandler}
        onEnded={onGestureEnd}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View style={[
          styles.itemCard, 
          animatedStyle,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }
        ]}>
          <View style={styles.leftRow}>
            <View style={[
              styles.txIconContainer, 
              { backgroundColor: transaction.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }
            ]}>
              {transaction.type === 'income' ? (
                <ArrowUpRight size={20} color="#10B981" />
              ) : (
                <ArrowDownRight size={20} color="#F43F5E" />
              )}
            </View>
            <View style={styles.txMeta}>
              <Text style={[styles.txTitleText, { color: colors.text }]}>
                {transaction.description}
              </Text>
              <View style={styles.txSubMeta}>
                <Text style={styles.categoryBadge}>{transaction.category}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={[styles.accountLabelText, { color: accountColor }]}>
                  {accountName}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[
            styles.txAmountText, 
            { color: transaction.type === 'income' ? '#10B981' : '#F43F5E' }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{fmt(transaction.amount)}
          </Text>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

// --- Mobile Home Screen Component ---
export const DashboardMobile: React.FC<{ 
  onAddTransactionPress: () => void;
  onNavigateSettings: () => void;
}> = ({ onAddTransactionPress, onNavigateSettings }) => {
  const theme = useFinanceStore((state) => state.theme);
  const currency = useFinanceStore((state) => state.currency);
  const colors = getThemeColors(theme);
  const fmt = (amount: number) => formatCurrency(amount, currency);
  const currencyDef = SUPPORTED_CURRENCIES.find(c => c.code === currency) ?? SUPPORTED_CURRENCIES[0];
  
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const budgets = useFinanceStore((state) => state.budgets);
  const selectedAccountId = useFinanceStore((state) => state.selectedAccountId);
  const setSelectedAccountId = useFinanceStore((state) => state.setSelectedAccountId);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const filteredTransactions = selectedAccountId 
    ? transactions.filter(t => t.accountId === selectedAccountId)
    : transactions;

  // Ledger Aggregates
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const overallBudget = budgets.find(b => b.category === 'all') || { spent: 0, limit: 1 };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>COINBURST</Text>
            <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
              Tactical Portfolio Monitor
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={onNavigateSettings}
              style={[styles.headerBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            >
              <Settings size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Aggregate Net Worth Panel */}
        <View style={[styles.netWorthCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.netWorthRow}>
            <View>
              <Text style={[styles.netWorthLabel, { color: colors.textMuted }]}>Focus Vault Balance</Text>
              <Text style={[styles.netWorthVal, { color: colors.text }]}>
                {fmt(selectedAccount ? selectedAccount.balance : totalBalance)}
              </Text>
            </View>
            <View style={styles.trendingContainer}>
              <TrendingUp size={24} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Horizontal Multi-Wallet sync Selector */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vault Nodes</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.accountPickerScrollView}
        >
          <TouchableOpacity
            onPress={() => setSelectedAccountId(null)}
            style={[
              styles.accountPill, 
              { 
                backgroundColor: selectedAccountId === null ? '#FFFFFF' : colors.cardBg,
                borderColor: selectedAccountId === null ? '#FFFFFF' : colors.cardBorder 
              }
            ]}
          >
            <Text style={[
              styles.accountPillText, 
              { color: selectedAccountId === null ? '#000000' : colors.text }
            ]}>
              All Node LEDGERS
            </Text>
          </TouchableOpacity>
          {accounts.map(acc => (
            <TouchableOpacity
              key={acc.id}
              onPress={() => setSelectedAccountId(acc.id)}
              style={[
                styles.accountPill,
                { 
                  backgroundColor: selectedAccountId === acc.id ? acc.color : colors.cardBg,
                  borderColor: acc.color 
                }
              ]}
            >
              <Text style={[
                styles.accountPillText,
                { color: selectedAccountId === acc.id ? '#FFFFFF' : colors.text }
              ]}>
                {acc.name} ({currencyDef.symbol}{acc.balance})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Gamified Budget Progress Sentinel */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Sentry Status</Text>
        </View>
        <View style={[styles.budgetPanelCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.budgetRow}>
            <MobileLiquidProgressBar spent={overallBudget.spent} limit={overallBudget.limit} />
            <View style={styles.budgetStats}>
              <Text style={[styles.budgetStatLabel, { color: colors.textMuted }]}>MONTHLY SPENDING CAP</Text>
              <Text style={[styles.budgetStatVal, { color: colors.text }]}>{fmt(overallBudget.limit)}</Text>
              
              <Text style={[styles.budgetStatLabel, { color: colors.textMuted, marginTop: 12 }]}>CURRENT HARVEST BURN</Text>
              <Text style={[styles.budgetStatVal, { color: colors.accentPink }]}>{fmt(overallBudget.spent)}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Ledger transaction Feed */}
        <View style={styles.feedHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Realtime Ledger Feed</Text>
          <TouchableOpacity 
            onPress={onAddTransactionPress}
            style={[styles.addTxButton, { backgroundColor: colors.accent }]}
          >
            <Plus size={16} color="#000000" />
            <Text style={styles.addTxBtnText}>ADD TX</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txFeedContainer}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyFeed}>
              <Text style={[styles.emptyFeedText, { color: colors.textMuted }]}>
                No operations recorded in this node focus.
              </Text>
            </View>
          ) : (
            filteredTransactions.map(tx => {
              const acc = accounts.find(a => a.id === tx.accountId) || { color: '#9CA3AF', name: 'Unknown' };
              return (
                <SwipeableTransactionItem
                  key={tx.id}
                  transaction={tx}
                  accountColor={acc.color}
                  accountName={acc.name}
                  onDelete={deleteTransaction}
                  colors={colors}
                />
              );
            })
          )}
        </View>

      </ScrollView>
    </GestureHandlerRootView>
  );
};

// --- Native Stylesheet ---
const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFFFF'
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  netWorthCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  netWorthLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  netWorthVal: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
    fontFamily: 'System'
  },
  trendingContainer: {
    padding: 10,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 14
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  accountPickerScrollView: {
    flexDirection: 'row',
    marginBottom: 24
  },
  accountPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  accountPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  budgetPanelCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  budgetStats: {
    flex: 1,
    marginLeft: 20
  },
  budgetStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1
  },
  budgetStatVal: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  addTxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  addTxBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000'
  },
  txFeedContainer: {
    marginBottom: 20
  },
  emptyFeed: {
    paddingVertical: 32,
    alignItems: 'center'
  },
  emptyFeedText: {
    fontSize: 12,
    fontWeight: '600'
  },
  // Swipeable specific styles
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16
  },
  deleteUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 16
  },
  trashBinContainer: {
    marginRight: 24
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  txIconContainer: {
    padding: 10,
    borderRadius: 12
  },
  txMeta: {
    justifyContent: 'center'
  },
  txTitleText: {
    fontSize: 14,
    fontWeight: '700'
  },
  txSubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase'
  },
  dotSeparator: {
    color: '#4B5563',
    fontSize: 10
  },
  accountLabelText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  txAmountText: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'System'
  },
  // Liquid progress overlay style
  liquidContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  liquidTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  liquidPercentageText: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'System'
  },
  liquidLabelText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2
  },
  liquidSubText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '600'
  }
});
