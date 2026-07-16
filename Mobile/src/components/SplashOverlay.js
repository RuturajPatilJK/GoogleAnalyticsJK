import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../theme';

const LOGO = require('../../assets/jkindia.png');
const GOLD = '#c9a24b';

export default function SplashOverlay({ onFinish }) {
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY        = useRef(new Animated.Value(10)).current;
  const barWidth     = useRef(new Animated.Value(0)).current;
  const overlayFade  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ringScale,   { toValue: 1.18, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textY,       { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(barWidth,    { toValue: 120, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ]),
      Animated.delay(500),
      Animated.timing(overlayFade, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start(() => onFinish && onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: overlayFade }]} pointerEvents="none">
      <LinearGradient colors={['#0e5e40', '#013720', '#021d13']} style={StyleSheet.absoluteFill} />

      <View style={styles.center}>
        <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
        <Animated.View style={[styles.logoCard, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }], alignItems: 'center' }}>
          <Text style={styles.title}>JK India</Text>
          <Text style={styles.subtitle}>Analytics Dashboard</Text>
          <Animated.View style={[styles.bar, { width: barWidth }]} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 136, height: 136, borderRadius: 68,
    borderWidth: 1.5, borderColor: 'rgba(201,162,75,0.45)',
  },
  logoCard: {
    width: 108, height: 108, borderRadius: 54,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14,
    elevation: 8,
  },
  logo: { width: 84, height: 84 },
  title: { color: '#ffffff', fontSize: 24, fontFamily: FONTS.bold, letterSpacing: 0.3 },
  subtitle: { color: GOLD, fontSize: 12.5, fontFamily: FONTS.semi, letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 5 },
  bar: {
    height: 3, borderRadius: 99, backgroundColor: GOLD, marginTop: 18,
  },
});
