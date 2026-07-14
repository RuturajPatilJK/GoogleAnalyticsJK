import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
  Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompanies, userLogin, getGAPermission } from '../services/api';
import { C, FONTS } from '../theme';

const JK_LOGO = require('../../assets/jkindia.png');

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [companies, setCompanies]           = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [username, setUsername]             = useState('');
  const [password, setPassword]             = useState('');
  const [showPass, setShowPass]             = useState(false);
  const [loading, setLoading]               = useState(false);
  const [loadingCo, setLoadingCo]           = useState(true);
  const [error, setError]                   = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    checkSession();
    loadCompanies();
  }, []);

  const checkSession = async () => {
    const user = await AsyncStorage.getItem('username');
    if (user) navigation.replace('DashboardHome');
  };

  const loadCompanies = async () => {
    try {
      const res = await getCompanies();
      const list = res.data.Company_Data || [];
      setCompanies(list);
      if (list.length > 0) setSelectedCompany(list[0]);
    } catch {
      setError('Could not load companies. Check server connection.');
    } finally {
      setLoadingCo(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await userLogin(username.trim(), password, selectedCompany.Company_Code);
      const uid = res.data.user_id;

      let hasGA = false;
      try {
        const perm = await getGAPermission(selectedCompany.Company_Code, uid);
        hasGA = perm.data?.UserDetails?.canView === 'Y';
      } catch {}

      await AsyncStorage.multiSet([
        ['username', username.trim()],
        ['uid', String(uid)],
        ['Company_Code', String(selectedCompany.Company_Code)],
        ['Company_Name', selectedCompany.Company_Name_E || ''],
        ['has_ga_permission', hasGA ? 'Y' : 'N'],
      ]);

      navigation.replace('DashboardHome');
    } catch (e) {
      if (e.response) {
        setError(e.response.data?.error || 'Invalid credentials. Please try again.');
      } else {
        setError('Could not reach the server. Check your network connection and server address.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Brand */}
            <View style={styles.brand}>
              <View style={styles.logoBadge}>
                <Image source={JK_LOGO} style={styles.logoImg} resizeMode="contain" />
              </View>
              <Text style={styles.brandName}>JK India eAgriTech Limited</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Sign In</Text>
              <Text style={styles.cardHint}>Enter your credentials to continue.</Text>

              {/* Username */}
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={t => { setUsername(t); setError(''); }}
                placeholder="Enter username"
                placeholderTextColor={C.dimmed}
                autoCapitalize="none"
                autoCorrect={false}
                color={C.text}
                fontFamily={FONTS.regular}
              />

              {/* Password */}
              <Text style={styles.label}>Password</Text>
              <View style={[styles.input, styles.passRow]}>
                <TextInput
                  style={{ flex: 1, color: C.text, fontFamily: FONTS.regular, fontSize: 15 }}
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  placeholder="Enter password"
                  placeholderTextColor={C.dimmed}
                  secureTextEntry={!showPass}
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <Text style={{ color: C.muted, fontSize: 15, paddingLeft: 8 }}>{showPass ? '👁' : '🔒'}</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.loginBtn, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#0e5e40', '#013720']} style={styles.loginBtnInner}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.loginBtnText}>Sign In  →</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>JK India eAgriTech Limited</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logoBadge: {
    width: 80, height: 80, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2, borderColor: 'rgba(201,162,75,0.4)',
    padding: 6,
    shadowColor: '#0f1a16',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoImg: { width: 68, height: 68 },
  brandName: { color: C.text, fontSize: 21, fontFamily: FONTS.bold, marginBottom: 5 },
  brandSub: { color: C.muted, fontSize: 13, fontFamily: FONTS.regular },
  card: {
    backgroundColor: C.bgCard,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0f1a16',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeading: { color: C.text, fontSize: 22, fontFamily: FONTS.bold, marginBottom: 6 },
  cardHint: { color: C.muted, fontSize: 13, fontFamily: FONTS.regular, marginBottom: 20, lineHeight: 18 },
  label: {
    color: C.dimmed,
    fontSize: 11,
    fontFamily: FONTS.semi,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
  },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  errorText: { color: C.error, fontSize: 13, fontFamily: FONTS.regular, marginTop: 12 },
  loginBtn: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  loginBtnInner: { padding: 16, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontFamily: FONTS.bold, letterSpacing: 0.4 },
  footer: { color: C.dimmed, fontSize: 11, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 28 },
});
