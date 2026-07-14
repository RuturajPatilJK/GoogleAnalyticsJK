import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Image, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, FONTS } from '../theme';

const LOGOS = {
  EBuySugar:   require('../../assets/ebuysugar.png'),
  ChiniMandi:  require('../../assets/chinimandi.png'),
  BioEnergy:   require('../../assets/bioenergytimes.png'),
  AgriInsights:require('../../assets/agriinsite.png'),
  SEIC:        require('../../assets/seic.png'),
};
const JK_LOGO = require('../../assets/jkindia.png');

const CARDS = [
  {
    screen:   'EBuySugar',
    label:    'eBuySugar',
    sub:      'Online sugar trading platform analytics',
    accent:   '#b45309',
    url:      'ebuysugar.com',
  },
  {
    screen:   'ChiniMandi',
    label:    'ChiniMandi',
    sub:      'Sugar industry news & market prices',
    accent:   '#16a34a',
    url:      'chinimandi.com',
  },
  {
    screen:   'BioEnergy',
    label:    'BioEnergy Times',
    sub:      'Renewable energy & biofuel insights',
    accent:   '#0b6e6e',
    url:      'bioenergytimes.com',
  },
  {
    screen:   'AgriInsights',
    label:    'AgriInsights',
    sub:      'Agriculture & commodity portal analytics',
    accent:   '#16a34a',
    url:      'agriinsite.com',
  },
  {
    screen:   'SEIC',
    label:    'SEIC Conference',
    sub:      'Sugar & Ethanol India Conference · seic.events',
    accent:   '#7c3aed',
    url:      'seic.events',
  },
];

export default function DashboardHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [username, setUsername]   = useState('');
  const [company, setCompany]     = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    AsyncStorage.multiGet(['username', 'Company_Name']).then(pairs => {
      setUsername(pairs[0][1] || 'User');
      setCompany(pairs[1][1] || '');
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <View style={styles.root}>
      {/* Header — paddingTop uses the real safe-area inset so it's never
          hidden behind the status bar / camera cutout on Android */}
      <View style={[styles.header, { paddingTop: insets.top + 13 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoPill}>
            <Image source={JK_LOGO} style={styles.headerLogoImg} resizeMode="contain" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>Google Analytics</Text>
            <Text style={styles.headerSub} numberOfLines={1}>Live Dashboard · JK India eAgriTech</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.75}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* User chip */}
          <View style={styles.userChip}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{username?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{username}</Text>
              {company ? <Text style={styles.userCompany}>{company}</Text> : null}
            </View>
          </View>

          <Text style={styles.sectionLabel}>Select Dashboard</Text>

          {CARDS.map((card) => (
            <TouchableOpacity
              key={card.screen}
              onPress={() => navigation.navigate(card.screen)}
              activeOpacity={0.82}
              style={[styles.card, { borderTopColor: card.accent }]}
            >
              <View style={styles.cardBody}>
                <View style={[styles.logoWrap, { borderColor: card.accent + '33' }]}>
                  <Image
                    source={LOGOS[card.screen]}
                    style={styles.cardLogo}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, { color: card.accent }]}>{card.label}</Text>
                  <Text style={styles.cardSub}>{card.sub}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`https://${card.url}`)} activeOpacity={0.7}>
                    <Text style={[styles.cardUrl, { color: card.accent }]}>{card.url} ↗</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.arrowBadge, { borderColor: card.accent + '44', backgroundColor: card.accent + '14' }]}>
                  <Text style={[styles.arrowText, { color: card.accent }]}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bgCard,
    gap: 10,
  },
  headerLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoPill: {
    width: 44, height: 44, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5, borderColor: 'rgba(201,162,75,0.4)',
    padding: 3,
    flexShrink: 0,
  },
  headerLogoImg: { width: 36, height: 36 },
  headerTitle: { color: C.text, fontSize: 16, fontFamily: FONTS.bold },
  headerSub: { color: C.muted, fontSize: 11, fontFamily: FONTS.regular, marginTop: 1 },
  logoutBtn: {
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    flexShrink: 0,
  },
  logoutText: { color: C.muted, fontSize: 12, fontFamily: FONTS.semi },
  scroll: { padding: 18, paddingTop: 14 },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0f1a16',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#013720',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#c9a24b', fontSize: 16, fontFamily: FONTS.bold },
  userName: { color: C.text, fontSize: 15, fontFamily: FONTS.semi },
  userCompany: { color: C.muted, fontSize: 12, fontFamily: FONTS.regular, marginTop: 1 },
  sectionLabel: {
    color: C.dimmed,
    fontSize: 10,
    fontFamily: FONTS.semi,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    marginBottom: 13,
    borderRadius: 16,
    padding: 16,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 3,
    shadowColor: '#0f1a16',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoWrap: {
    width: 52, height: 52, borderRadius: 12,
    padding: 5, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
  },
  cardLogo: { width: 42, height: 42 },
  cardLabel: { fontSize: 17, fontFamily: FONTS.bold, marginBottom: 4 },
  cardSub: { color: C.muted, fontSize: 12.5, fontFamily: FONTS.regular, lineHeight: 18 },
  cardUrl: { fontSize: 11, fontFamily: FONTS.semi, marginTop: 4, letterSpacing: 0.3 },
  arrowBadge: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0,
  },
  arrowText: { fontSize: 16, fontFamily: FONTS.bold },
  footer: {
    color: C.dimmed,
    fontSize: 11,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
});
