import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmail, signUpWithEmail } from '../shared/firebase';

export const LoginScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    if (isSignUp && !name) return Alert.alert('Error', 'Please enter your name');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (e: any) {
      Alert.alert('Auth Error', e.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <LinearGradient colors={['#FF007F', '#00FF88', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoGradient}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>CB</Text>
          </View>
        </LinearGradient>

        <Text style={styles.title}>CoinBurst</Text>
        <Text style={styles.subtitle}>Your Financial Nexus</Text>

        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#4B5563"
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#4B5563"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#4B5563"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          <LinearGradient colors={['#FF007F', '#00FF88']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={{ marginTop: 20 }}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07050F' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  logoGradient: { width: 80, height: 80, borderRadius: 20, padding: 3 },
  logoInner: { flex: 1, backgroundColor: '#0B0B0F', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 16 },
  subtitle: { fontSize: 12, color: '#9CA3AF', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4, marginBottom: 32 },
  input: { width: '100%', backgroundColor: '#0B0B0F', borderWidth: 1, borderColor: '#1E1E26', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 14, marginBottom: 12 },
  btn: { width: 280, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 },
  toggleText: { color: '#00FF88', fontSize: 13, fontWeight: '600' },
});
