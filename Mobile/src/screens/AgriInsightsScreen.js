import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TextInput, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { getAgriInsights } from '../services/api';
import { C, FONTS, AI_RANGE_OPTIONS } from '../theme';
import KPICard from '../components/KPICard';
import RangeBar from '../components/RangeBar';
import ChartCard from '../components/ChartCard';
import ScreenHeader from '../components/ScreenHeader';

const LOGO = require('../../assets/agriinsite.png');

const PAD = 18;
const ACCENT = '#16a34a';
const CAT_COLORS = ['#013720', '#c9a24b', '#0b6e6e', '#b45309', '#7c3aed', '#0ea5e9', '#dc2626', '#16a34a'];

const fmt = (n) => {
  if (n === undefined || n === null) return '—';
  const v = parseFloat(n);
  if (isNaN(v)) return '—';
  return Math.round(v).toLocaleString('en-IN');
};

const today = () => new Date().toISOString().slice(0, 10);

export default function AgriInsightsScreen({ navigation }) {
  const { width: SW } = useWindowDimensions();
  const CHART_W = SW - PAD * 2 - 32;

  const [range, setRange]       = useState('today');
  const [start, setStart]       = useState(today());
  const [end, setEnd]           = useState(today());
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetch = useCallback((r, s, e) => {
    setLoading(true);
    setError(null);
    getAgriInsights(r, s, e)
      .then(res => setData(res.data || null))
      .catch(er => setError(er.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch('today', '', ''); }, [fetch]);

  const handleRange = (r) => {
    setRange(r);
    if (r !== 'custom') fetch(r, '', '');
  };

  const handleCustomApply = () => fetch('custom', start, end);

  const languages = data?.languages || {};
  const langEntries = Object.entries(languages)
    .map(([name, count]) => [name, Number(count) || 0])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  // No text label on the bars themselves (would get cut off on narrow screens);
  // full names are shown in the un-truncated legend rows below the chart instead.
  const langBar = langEntries.map(([, val], i) => ({
    value: val,
    label: '',
    frontColor: CAT_COLORS[i % CAT_COLORS.length],
  }));
  const maxLang = langEntries.length > 0 ? langEntries[0][1] : 0;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="AgriInsights"
        subtitle="Article publishing analytics"
        url="https://agriinsite.com"
        accent={ACCENT}
        badge="Live"
        logoSrc={LOGO}
        logoBg="#ffffff"
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <RangeBar options={AI_RANGE_OPTIONS} selected={range} onSelect={handleRange} accent={ACCENT} />

        {range === 'custom' && (
          <View style={styles.customRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TextInput
                style={styles.dateInput}
                value={start}
                onChangeText={setStart}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.dimmed}
                color={C.text}
                fontFamily={FONTS.regular}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TextInput
                style={styles.dateInput}
                value={end}
                onChangeText={setEnd}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.dimmed}
                color={C.text}
                fontFamily={FONTS.regular}
              />
            </View>
            <TouchableOpacity style={[styles.applyBtn, { borderColor: ACCENT }]} onPress={handleCustomApply} activeOpacity={0.8}>
              <Text style={[styles.applyText, { color: ACCENT }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadBox}>
            <ActivityIndicator color={ACCENT} size="large" />
            <Text style={styles.loadText}>Fetching AgriInsights…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={() => fetch(range, start, end)} style={[styles.retryBtn, { borderColor: ACCENT }]}>
              <Text style={[styles.retryText, { color: ACCENT }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && data && (
          <>
            {/* ── KPI strip, matching web (Total Articles + Views + Users) ── */}
            <View style={styles.kpiRow}>
              <KPICard label="Total Articles" value={fmt(data.total)} accent={ACCENT} />
              <KPICard label="Page Views" value={fmt(data.traffic?.views)} accent={ACCENT} />
            </View>
            <View style={styles.kpiRow}>
              <KPICard label="Users (WP)" value={fmt(data.traffic?.users)} accent={ACCENT} />
              <View style={{ flex: 1 }} />
            </View>

            {/* ── Language breakdown bar chart ── */}
            <ChartCard title="Articles by Language">
              {langBar.length > 0 ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: CHART_W }}>
                    <BarChart
                      data={langBar}
                      width={12 + langBar.length * 50 + 16}
                      height={160}
                      barWidth={30}
                      spacing={20}
                      initialSpacing={12}
                      roundedTop
                      showValuesAsTopLabel
                      topLabelTextStyle={{ color: C.muted, fontSize: 9, fontFamily: FONTS.semi }}
                      hideYAxisText
                      xAxisColor={C.borderDef}
                      yAxisColor="transparent"
                      rulesColor={C.border}
                      backgroundColor="transparent"
                      noOfSections={4}
                      isAnimated
                    />
                  </ScrollView>
                  {langBar.length > 5 && <Text style={styles.scrollHint}>← swipe to see all languages →</Text>}
                  <View style={{ marginTop: 12 }}>
                    {langEntries.map(([name, val], i) => (
                      <View key={name} style={styles.langRow}>
                        <View style={styles.langRowHead}>
                          <Text style={styles.langRowLabel}>{name}</Text>
                          <Text style={styles.langRowVal}>{fmt(val)}</Text>
                        </View>
                        <View style={styles.langRowTrack}>
                          <View style={[styles.langRowFill, { width: `${maxLang > 0 ? Math.max(3, Math.round((val / maxLang) * 100)) : 0}%`, backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }]} />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.noData}>No articles for this period.</Text>
              )}
            </ChartCard>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: PAD, paddingTop: 14 },
  customRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 6, alignItems: 'flex-end' },
  dateLabel: { color: C.dimmed, fontSize: 10, fontFamily: FONTS.semi, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  dateInput: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 10, fontSize: 13, color: C.text,
  },
  applyBtn: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, alignSelf: 'flex-end',
  },
  applyText: { fontFamily: FONTS.semi, fontSize: 13 },
  loadBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadText: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13 },
  errorBox: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  errorText: { color: C.error, fontFamily: FONTS.semi, fontSize: 14, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9 },
  retryText: { fontFamily: FONTS.semi, fontSize: 14 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  noData: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', paddingVertical: 30 },
  scrollHint: { color: C.dimmed, fontSize: 10, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 4 },
  langRow: { paddingVertical: 6 },
  langRowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  langRowLabel: { flex: 1, color: C.body, fontSize: 12, fontFamily: FONTS.regular, lineHeight: 16 },
  langRowVal: { color: C.text, fontSize: 12, fontFamily: FONTS.bold, flexShrink: 0 },
  langRowTrack: { height: 6, borderRadius: 99, backgroundColor: C.border, overflow: 'hidden' },
  langRowFill: { height: '100%', borderRadius: 99 },
});
