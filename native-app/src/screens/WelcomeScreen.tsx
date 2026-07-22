import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  userName: string;
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ userName, onComplete }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(30)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(barWidth, { toValue: 1, duration: 1500, useNativeDriver: false }),
      Animated.timing(fadeOut, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onComplete());
  }, []);

  const spin = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }, { rotate: spin }] }]}>
        <LinearGradient colors={['#FF007F', '#00FF88', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoGradient}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>CB</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textTranslate }], alignItems: 'center', marginTop: 32 }}>
        <Text style={styles.welcomeLabel}>✨ WELCOME BACK ✨</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.subtitle}>Your Financial Nexus awaits</Text>
      </Animated.View>

      <Animated.View style={[styles.barOuter, { opacity: textOpacity }]}>  
        <Animated.View style={{ width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height: '100%' }}>
          <LinearGradient colors={['#FF007F', '#00FF88', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 4 }} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07050F', justifyContent: 'center', alignItems: 'center' },
  logoWrap: { width: 96, height: 96 },
  logoGradient: { flex: 1, borderRadius: 24, padding: 3 },
  logoInner: { flex: 1, backgroundColor: '#0B0B0F', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  welcomeLabel: { fontSize: 12, color: '#9CA3AF', letterSpacing: 4, textTransform: 'uppercase', fontWeight: '700' },
  userName: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 8, textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#4B5563', letterSpacing: 3, textTransform: 'uppercase', marginTop: 8 },
  barOuter: { width: 180, height: 4, backgroundColor: '#1E1E26', borderRadius: 4, overflow: 'hidden', marginTop: 32 },
});
