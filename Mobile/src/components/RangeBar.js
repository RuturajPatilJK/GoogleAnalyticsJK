import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { C, FONTS } from '../theme';

export default function RangeBar({ options, selected, onSelect, accent = C.accent }) {
  const [expanded, setExpanded] = useState(false);
  const selectedLabel = options.find((o) => o.key === selected)?.label || selected;

  const handleSelect = (key) => {
    onSelect(key);
    setExpanded(false);
  };

  return (
    <View style={{ marginBottom: expanded ? 10 : 6 }}>
      <TouchableOpacity
        style={[styles.toggle, { borderColor: expanded ? accent : C.borderDef }]}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
      >
        <View style={styles.toggleLeft}>
          <Text style={[styles.filterIcon, { color: accent }]}>☰</Text>
          <Text style={styles.filterLabel}>Filter</Text>
        </View>
        <View style={[styles.selectedPill, { backgroundColor: accent }]}>
          <Text style={styles.selectedPillText}>{selectedLabel}</Text>
        </View>
        <Text style={[styles.chevron, { color: accent }]}>{expanded ? '⌃' : '⌄'}</Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.container}
        >
          {options.map((opt) => {
            const active = selected === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleSelect(opt.key)}
                style={[styles.pill, active && { backgroundColor: accent, borderColor: accent }]}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, active && { color: '#fff', fontFamily: FONTS.bold }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 9,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    backgroundColor: C.bgCard,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterIcon: { fontSize: 13, fontFamily: FONTS.semi },
  filterLabel: { color: C.body, fontSize: 13, fontFamily: FONTS.semi },
  selectedPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  selectedPillText: { color: '#fff', fontSize: 12, fontFamily: FONTS.bold },
  chevron: { fontSize: 13, fontFamily: FONTS.bold, marginLeft: 2 },

  scroll: { flexGrow: 0, marginTop: 8 },
  container: { paddingHorizontal: 4, paddingVertical: 2, gap: 8, flexDirection: 'row' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: C.borderDef,
    backgroundColor: C.bgCard,
  },
  pillText: {
    color: C.muted,
    fontSize: 13,
    fontFamily: FONTS.semi,
  },
});
