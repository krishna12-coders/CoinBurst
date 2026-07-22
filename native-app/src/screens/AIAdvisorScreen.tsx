import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useFinanceStore } from '../shared/useFinanceStore';
import { getThemeColors } from '../theme/colors';
import { generateAIResponse } from '../utils/aiCommandEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const AIAdvisorScreen: React.FC = () => {
  const { theme } = useFinanceStore();
  const c = getThemeColors(theme);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: '👋 Hi! I am your Nexus Portfolio Intelligence. Ask me anything about your spending, net worth, or financial goals!' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputMessage.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await generateAIResponse(userMsg.text);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: '⚠️ Unable to connect to AI engine.' };
      setMessages(prev => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: c.textMuted }]}>GEMINI 2.0 INTEL</Text>
        <Text style={[styles.headerTitle, { color: c.text }]}>AI Advisor</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={[
            styles.msgBubble,
            item.sender === 'user'
              ? [styles.userBubble, { backgroundColor: c.accent + '20', borderColor: c.accent }]
              : [styles.aiBubble, { backgroundColor: c.card, borderColor: c.cardBorder }]
          ]}>
            <Text style={[styles.senderLabel, { color: item.sender === 'user' ? c.accent : c.textMuted }]}>
              {item.sender === 'user' ? 'YOU' : 'NEXUS AI'}
            </Text>
            <Text style={[styles.msgText, { color: c.text }]}>{item.text}</Text>
          </View>
        )}
      />

      {loading && (
        <View style={{ padding: 8, alignItems: 'center' }}>
          <ActivityIndicator color={c.accent} />
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputRow, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <TextInput
          style={[styles.textInput, { color: c.text }]}
          placeholder="Ask AI Advisor..."
          placeholderTextColor={c.textMuted}
          value={inputMessage}
          onChangeText={setInputMessage}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity onPress={handleSend} disabled={loading} style={[styles.sendBtn, { backgroundColor: c.accent }]}>
          <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 8 },
  headerLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  msgBubble: { borderRadius: 14, padding: 14, borderWidth: 1, marginVertical: 4, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end' },
  aiBubble: { alignSelf: 'flex-start' },
  senderLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  msgText: { fontSize: 13, lineHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 90, marginTop: 8 },
  textInput: { flex: 1, fontSize: 14 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});
