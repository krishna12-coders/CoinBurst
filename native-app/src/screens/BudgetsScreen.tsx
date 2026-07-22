import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';
import { getThemeColors } from '../theme/colors';

export const BudgetsScreen: React.FC = () => {
  const { budgets, addBudget, deleteBudget, theme, currency } = useFinanceStore();
  const c = getThemeColors(theme);
  const fmt = (val: number) => formatCurrency(val, currency);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  const categories = ['Food', 'Bills', 'Shopping', 'Entertainment', 'Transport', 'Other'];

  const handleAddBudget = () => {
    if (!limit || isNaN(Number(limit)) || Number(limit) <= 0) {
      return Alert.alert('Invalid Limit', 'Please enter a positive budget limit.');
    }
    addBudget({
      category,
      limit: Number(limit),
      assigned: 0,
      month: new Date().toISOString().substring(0, 7),
    });
    setLimit('');
    setIsModalOpen(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: c.textMuted }]}>ENFORCEMENT ENGINE</Text>
        <Text style={[styles.headerTitle, { color: c.text }]}>Smart Budgets</Text>
      </View>

      <TouchableOpacity onPress={() => setIsModalOpen(true)} style={[styles.addBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={[styles.addBtnText, { color: c.accent }]}>+ Set New Category Limit</Text>
      </TouchableOpacity>

      {budgets.map(b => {
        const percent = Math.min(100, (b.spent / b.limit) * 100);
        const isOver = b.spent > b.limit;
        return (
          <View key={b.id} style={[styles.budgetCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.catName, { color: c.text }]}>{b.category}</Text>
              <TouchableOpacity onPress={() => deleteBudget(b.id)}>
                <Text style={{ color: c.expense }}>🗑️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.amountsRow}>
              <Text style={[styles.spentText, { color: isOver ? c.expense : c.text }]}>
                {fmt(b.spent)} <Text style={{ color: c.textMuted, fontSize: 12 }}>of {fmt(b.limit)}</Text>
              </Text>
              <Text style={[styles.percentText, { color: isOver ? c.expense : c.accent }]}>
                {percent.toFixed(0)}%
              </Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: c.input }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${percent}%`,
                    backgroundColor: isOver ? c.expense : percent > 80 ? '#F59E0B' : c.accent,
                  }
                ]}
              />
            </View>
          </View>
        );
      })}

      {budgets.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={{ color: c.textMuted }}>No active budget limits. Click above to enforce one!</Text>
        </View>
      )}

      {/* Add Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Set Budget Limit</Text>

            <Text style={[styles.label, { color: c.textMuted }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginVertical: 8 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, { backgroundColor: category === cat ? c.accent : c.input }]}
                >
                  <Text style={{ color: category === cat ? '#000' : c.text, fontWeight: 'bold', fontSize: 11 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.modalInput, { backgroundColor: c.input, color: c.text }]}
              placeholder="Monthly Limit ($)"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
              value={limit}
              onChangeText={setLimit}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={[styles.actionBtn, { backgroundColor: c.input }]}>
                <Text style={{ color: c.textMuted, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddBudget} style={[styles.actionBtn, { backgroundColor: c.accent }]}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>Enforce Limit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 8 },
  headerLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  addBtn: { borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', marginVertical: 12 },
  addBtnText: { fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  budgetCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontSize: 16, fontWeight: '800' },
  amountsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 },
  spentText: { fontSize: 18, fontWeight: '900' },
  percentText: { fontSize: 14, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  progressBar: { height: '100%', borderRadius: 4 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { borderRadius: 16, padding: 20, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  modalInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginVertical: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});
