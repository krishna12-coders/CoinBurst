import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useFinanceStore, SUPPORTED_CURRENCIES } from '../shared/useFinanceStore';
import type { Transaction } from '../shared/useFinanceStore';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { X, Tag, Layers, Calendar } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface AddTransactionMobileProps {
  sheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const AddTransactionMobile: React.FC<AddTransactionMobileProps> = ({ sheetRef, onClose, transactionToEdit }) => {
  const accounts = useFinanceStore((state) => state.accounts);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const theme = useFinanceStore((state) => state.theme);
  const currency = useFinanceStore((state) => state.currency);
  const currencyDef = SUPPORTED_CURRENCIES.find(c => c.code === currency) ?? SUPPORTED_CURRENCIES[0];

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  // Pre-fill fields if editing a transaction
  React.useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setAccountId(transactionToEdit.accountId);
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Food');
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [transactionToEdit, accounts]);

  const categories = ['Food', 'Entertainment', 'Salary', 'Rent', 'Shopping', 'Utilities', 'Travel'];

  // Bottom Sheet Configuration
  const snapPoints = useMemo(() => ['75%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  // Audio Playback Handler
  const playChaChingSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        // Assuming asset is in local assets folder
        require('../assets/sounds/cha-ching.mp3'),
        { shouldPlay: true }
      );
      // Automatically unload sound from memory when done playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Failed to load or play sound asset', error);
      // Fallback: simple system audio trigger
    }
  };

  const handleSubmit = async () => {
    if (!description || !amount || !accountId) return;

    // 1. Add/Update Transaction in Zustand Store
    if (transactionToEdit) {
      updateTransaction({
        ...transactionToEdit,
        description,
        amount: parseFloat(amount),
        type,
        category,
        accountId,
        date: new Date().toISOString(),
      });
    } else {
      addTransaction({
        description,
        amount: parseFloat(amount),
        type,
        category,
        accountId,
        date: new Date().toISOString(),
      });
    }

    // 2. Trigger Expo Haptics Success (Intentional dual-pulse haptic shake)
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log('Haptics not supported in this environment');
    }

    // 3. Play sound (cha-ching.mp3)
    await playChaChingSound();

    // Reset Form & Collapse Sheet
    setDescription('');
    setAmount('');
    sheetRef.current?.close();
  };

  // Theming Helpers
  const isDark = theme === 'dark' || theme === 'cyberpunk';
  const sheetBg = theme === 'cyberpunk' ? '#1F0E3D' : theme === 'dark' ? '#0B0B0F' : '#FFFFFF';
  const cardBorder = theme === 'cyberpunk' ? '#FF007F' : theme === 'dark' ? '#1E1E26' : '#E5E7EB';
  const textColor = theme === 'cyberpunk' ? '#FFE600' : isDark ? '#FFFFFF' : '#1F2937';
  const textMuted = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = theme === 'cyberpunk' ? '#12042C' : isDark ? '#000000' : '#F3F4F6';

  // Backdrop rendering
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: sheetBg, borderWidth: theme === 'cyberpunk' ? 2 : 0, borderColor: cardBorder }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#374151' : '#D1D5DB' }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Record Transaction</Text>
            <TouchableOpacity
              onPress={() => sheetRef.current?.close()}
              style={styles.closeBtn}
            >
              <X size={18} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Income / Expense Toggle Switch */}
          <View style={[styles.toggleContainer, { backgroundColor: inputBg, borderColor: cardBorder }]}>
            <TouchableOpacity
              onPress={() => setType('expense')}
              style={[
                styles.toggleBtn,
                type === 'expense' && { backgroundColor: '#F43F5E', shadowColor: '#F43F5E', shadowOpacity: 0.3 }
              ]}
            >
              <Text style={[styles.toggleBtnText, type === 'expense' ? styles.activeText : { color: textMuted }]}>
                Capital Burn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType('income')}
              style={[
                styles.toggleBtn,
                type === 'income' && { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.3 }
              ]}
            >
              <Text style={[styles.toggleBtnText, type === 'income' ? styles.activeText : { color: textMuted }]}>
                Capital Harvest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Amount Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>Transaction Value ({currencyDef.code})</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                <View style={styles.inputIcon}>
                  <Text style={{ color: textMuted, fontWeight: 'bold', fontSize: 16 }}>{currencyDef.symbol}</Text>
                </View>
                <TextInput
                  style={[styles.textInput, { color: textColor, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}
                  placeholder="0.00"
                  placeholderTextColor={textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* Description Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>Description</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                <TextInput
                  style={[styles.textInput, { color: textColor, paddingLeft: 16 }]}
                  placeholder="e.g. Sushi Dinner with partners"
                  placeholderTextColor={textMuted}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Quick selectors for Category */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScrollView}
              >
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryTag,
                      { backgroundColor: category === cat ? (theme === 'cyberpunk' ? '#FF007F' : '#3B82F6') : inputBg }
                    ]}
                  >
                    <Text style={[
                      styles.categoryTagText,
                      { color: category === cat ? '#FFFFFF' : textColor }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quick selectors for Account Node */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>Vault Node</Text>
              <View style={styles.accountSelectorContainer}>
                {accounts.map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setAccountId(acc.id)}
                    style={[
                      styles.accountSelectPill,
                      {
                        borderColor: accountId === acc.id ? acc.color : cardBorder,
                        backgroundColor: accountId === acc.id ? `${acc.color}15` : inputBg
                      }
                    ]}
                  >
                    <View style={[styles.accountDot, { backgroundColor: acc.color }]} />
                    <Text style={[styles.accountSelectPillText, { color: textColor }]}>
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitBtn,
                { backgroundColor: theme === 'cyberpunk' ? '#FFE600' : '#10B981' }
              ]}
            >
              <Text style={[styles.submitBtnText, { color: theme === 'cyberpunk' ? '#12042C' : '#FFFFFF' }]}>
                Transmit to Ledger
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

// --- Native Bottom Sheet Stylesheet ---
const styles = StyleSheet.create({
  keyboardView: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    flex: 1
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  closeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  activeText: {
    color: '#FFFFFF'
  },
  form: {
    gap: 16
  },
  fieldGroup: {
    gap: 8
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  inputWrapper: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    overflow: 'hidden'
  },
  inputIcon: {
    paddingLeft: 16,
    justifyContent: 'center'
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '600'
  },
  categoryScrollView: {
    flexDirection: 'row'
  },
  categoryTag: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  accountSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  accountSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  accountSelectPillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '950',
    textTransform: 'uppercase',
    letterSpacing: 1
  }
});
