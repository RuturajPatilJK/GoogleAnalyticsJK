import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, FONTS } from '../theme';

export default function KPICard({ label, value, accent = C.accent, sub }) {
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: C.text }]}>{value ?? '—'}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 100,
    shadowColor: '#0f1a16',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    color: C.muted,
    fontSize: 10.5,
    fontFamily: FONTS.semi,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    letterSpacing: -0.4,
  },
  sub: {
    color: C.dimmed,
    fontSize: 10.5,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});
