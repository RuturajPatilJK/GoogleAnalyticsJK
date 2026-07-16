import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TextInput, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { getAgriInsights, getGA4 } from '../services/api';
import { C, FONTS, AI_RANGE_OPTIONS } from '../theme';
import KPICard from '../components/KPICard';
import RangeBar from '../components/RangeBar';
import ChartCard from '../components/ChartCard';
import ScreenHeader from '../components/ScreenHeader';

const LOGO = require('../../assets/agriinsite.png');

const PAD = 18;
const ACCENT = '#16a34a';
const GOLD = '#c9a24b';
const CAT_COLORS = ['#013720', '#c9a24b', '#0b6e6e', '#b45309', '#7c3aed', '#0ea5e9', '#dc2626', '#16a34a'];
const CHANNEL_COLORS = ['#013720', '#c9a24b', '#0b6e6e', '#8ad7ba', '#d8b86a', '#34b083', '#7c3aed', '#ec4899'];

const fmt = (n) => {
  if (n === undefined || n === null || n === '') return '—';
  const v = parseFloat(n);
  if (isNaN(v)) return '—';
  return Math.round(v).toLocaleString('en-IN');
};

const today = () => new Date().toISOString().slice(0, 10);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDateFull = (d) => {
  if (!d || d.length !== 8) return d;
  return `${MONTHS[parseInt(d.slice(4, 6), 10) - 1]} ${d.slice(6, 8)}, ${d.slice(0, 4)}`;
};

const BAR_SPACING = 20;
const BAR_INITIAL_SPACING = 12;
const barContentWidth = (count, barWidth) =>
  BAR_INITIAL_SPACING + count * (barWidth + BAR_SPACING) + 16;

const LINE_SPACING = 34;
const LINE_INITIAL_SPACING = 16;
const lineContentWidth = (count) =>
  LINE_INITIAL_SPACING + Math.max(count - 1, 0) * LINE_SPACING + 24;

function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.max(3, Math.round((value / max) * 100)) : 0;
  return (
    <View style={styles.barRow}>
      <View style={styles.barRowHead}>
        <Text style={styles.barRowLabel}>{label}</Text>
        <Text style={styles.barRowVal}>{fmt(value)}</Text>
      </View>
      <View style={styles.barRowTrack}>
        <View style={[styles.barRowFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function AgriInsightsScreen({ navigation }) {
  const { width: SW } = useWindowDimensions();
  const CHART_W = SW - PAD * 2 - 32;

  const [range, setRange]       = useState('today');
  const [start, setStart]       = useState(today());
  const [end, setEnd]           = useState(today());

  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const [gaData, setGaData]       = useState(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [gaError, setGaError]     = useState(null);

  const fetchArticles = useCallback((r, s, e) => {
    setLoading(true);
    setError(null);
    getAgriInsights(r, s, e)
      .then(res => setData(res.data || null))
      .catch(er => setError(er.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const fetchGA4 = useCallback((r, s, e) => {
    setGaLoading(true);
    setGaError(null);
    getGA4('agriinsite', r, s, e)
      .then(res => setGaData(res.data?.agriinsite || null))
      .catch(er => setGaError(er.message || 'Failed to load'))
      .finally(() => setGaLoading(false));
  }, []);

  const fetchAll = useCallback((r, s, e) => {
    fetchArticles(r, s, e);
    fetchGA4(r, s, e);
  }, [fetchArticles, fetchGA4]);

  useEffect(() => { fetchAll('today', '', ''); }, [fetchAll]);

  const handleRange = (r) => {
    setRange(r);
    if (r !== 'custom') fetchAll(r, '', '');
  };

  const handleCustomApply = () => fetchAll('custom', start, end);

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

  // ── GA4 website-traffic derived data ──
  const kpi = gaData?.kpi || {};
  const trend = gaData?.trend || [];
  const devices = gaData?.devices || [];
  const channels = gaData?.channels || [];
  const pages = gaData?.pages || [];
  const countries = gaData?.countries || [];

  const usersLine = trend.map((t) => ({
    value: Math.round(t.activeUsers || 0),
    label: '',
    dateFull: fmtDateFull(t.date),
  }));
  const trendRangeCaption = trend.length > 0
    ? `${fmtDateFull(trend[0].date)} – ${fmtDateFull(trend[trend.length - 1].date)}`
    : '';
  const sessionsLine = trend.map((t) => ({ value: Math.round(t.sessions || 0) }));

  const devicePie = devices.map((d, i) => ({
    value: Math.round(d.activeUsers || 0),
    color: CAT_COLORS[i % CAT_COLORS.length],
    label: d.deviceCategory || '',
  }));
  const deviceTotal = devicePie.reduce((s, d) => s + d.value, 0);

  const maxChannel = Math.max(1, ...channels.map(c => c.sessions || c.activeUsers || 0));
  const maxCountry = Math.max(1, ...countries.map(c => c.activeUsers || 0));
  const maxPage = Math.max(1, ...pages.map(p => p.screenPageViews || 0));

  const pointerConfig = {
    pointerStripHeight: 140,
    pointerStripColor: C.borderDef,
    pointerStripWidth: 2,
    pointerColor: ACCENT,
    radius: 5,
    pointerLabelWidth: 130,
    pointerLabelHeight: 64,
    activatePointersOnLongPress: false,
    autoAdjustPointerLabelPosition: true,
    pointerLabelComponent: (items) => (
      <View style={styles.tooltip}>
        {items[0]?.dateFull ? <Text style={styles.tooltipLabel}>{items[0].dateFull}</Text> : null}
        <Text style={styles.tooltipText}>Users: {fmt(items[0]?.value)}</Text>
        {items[1] ? <Text style={styles.tooltipText}>Sessions: {fmt(items[1]?.value)}</Text> : null}
      </View>
    ),
  };

  return (
    <GestureHandlerRootView style={styles.root}>
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

        {/* ══════════════ Article Publishing (WordPress) ══════════════ */}
        {loading && (
          <View style={styles.loadBox}>
            <ActivityIndicator color={ACCENT} size="large" />
            <Text style={styles.loadText}>Fetching AgriInsights…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={() => fetchArticles(range, start, end)} style={[styles.retryBtn, { borderColor: ACCENT }]}>
              <Text style={[styles.retryText, { color: ACCENT }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && data && (
          <>
            <View style={styles.kpiRow}>
              <KPICard label="Total Articles" value={fmt(data.total)} accent={ACCENT} />
              <KPICard label="Page Views" value={fmt(data.traffic?.views)} accent={ACCENT} />
            </View>
            <View style={styles.kpiRow}>
              <KPICard label="Users (WP)" value={fmt(data.traffic?.users)} accent={ACCENT} />
              <View style={{ flex: 1 }} />
            </View>

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

        {/* ══════════════ Website Traffic (Google Analytics 4) ══════════════ */}
        <Text style={styles.sectionDivider}>Website Traffic · GA4</Text>

        {gaLoading && (
          <View style={styles.loadBox}>
            <ActivityIndicator color={ACCENT} size="large" />
            <Text style={styles.loadText}>Fetching website analytics…</Text>
          </View>
        )}

        {gaError && !gaLoading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {gaError}</Text>
            <TouchableOpacity onPress={() => fetchGA4(range, start, end)} style={[styles.retryBtn, { borderColor: ACCENT }]}>
              <Text style={[styles.retryText, { color: ACCENT }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!gaLoading && !gaError && gaData && (
          <>
            <View style={styles.kpiRow}>
              <KPICard label="Active Users" value={fmt(kpi.activeUsers)} accent={ACCENT} />
              <KPICard label="Page Views"   value={fmt(kpi.screenPageViews)} accent={ACCENT} />
              <KPICard label="New Users"    value={fmt(kpi.newUsers)} accent={ACCENT} />
            </View>

            <ChartCard title="30-Day Traffic Trend" style={{ marginTop: 2 }}>
              {usersLine.length > 0 ? (
                <>
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    directionalLockEnabled
                    bounces={false}
                    showsHorizontalScrollIndicator
                    style={{ width: CHART_W }}
                  >
                    <LineChart
                      data={usersLine}
                      data2={sessionsLine}
                      width={lineContentWidth(usersLine.length)}
                      height={170}
                      areaChart
                      startFillColor={ACCENT}
                      endFillColor={ACCENT}
                      startOpacity={0.2}
                      endOpacity={0.02}
                      color={ACCENT}
                      color2={GOLD}
                      thickness={2.2}
                      thickness2={1.8}
                      curved
                      spacing={LINE_SPACING}
                      initialSpacing={LINE_INITIAL_SPACING}
                      hideDataPoints={usersLine.length > 10}
                      dataPointsColor={ACCENT}
                      dataPointsColor2={GOLD}
                      dataPointsRadius={3}
                      xAxisLabelTextStyle={{ color: 'transparent', fontSize: 1 }}
                      yAxisTextStyle={{ color: C.dimmed, fontSize: 9, fontFamily: FONTS.regular }}
                      xAxisColor={C.borderDef}
                      yAxisColor={C.borderDef}
                      rulesColor={C.border}
                      backgroundColor="transparent"
                      noOfSections={4}
                      formatYLabel={(v) => {
                        const n = parseFloat(v);
                        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
                        return String(Math.round(n));
                      }}
                      pointerConfig={pointerConfig}
                    />
                  </ScrollView>
                  <Text style={styles.rangeCaption}>{trendRangeCaption} · swipe to see all days · tap for exact values</Text>
                </>
              ) : (
                <Text style={styles.noData}>No trend data</Text>
              )}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: ACCENT }]} />
                  <Text style={styles.legendLabel}>Active Users</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: GOLD }]} />
                  <Text style={styles.legendLabel}>Sessions</Text>
                </View>
              </View>
            </ChartCard>

            {pages.length > 0 && (
              <ChartCard title="Top Pages" style={{ marginTop: 4 }}>
                {pages.slice(0, 8).map((p, i) => (
                  <BarRow key={i} label={p.pageTitle || 'Untitled'} value={p.screenPageViews} max={maxPage} color={ACCENT} />
                ))}
              </ChartCard>
            )}

            {devicePie.length > 0 && (
              <ChartCard title="Device Breakdown" style={{ marginTop: 4 }}>
                <View style={styles.pieWrap}>
                  <PieChart
                    data={devicePie}
                    donut
                    radius={70}
                    innerRadius={44}
                    centerLabelComponent={() => (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: C.text, fontFamily: FONTS.bold, fontSize: 15 }}>{fmt(deviceTotal)}</Text>
                        <Text style={{ color: C.muted, fontFamily: FONTS.regular, fontSize: 9 }}>users</Text>
                      </View>
                    )}
                  />
                </View>
                <View style={styles.legend}>
                  {devicePie.map((d) => (
                    <View key={d.label} style={styles.legendItem2}>
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <Text style={styles.legendLabel2}>{d.label}</Text>
                      <Text style={[styles.legendVal, { color: d.color }]}>{fmt(d.value)}</Text>
                    </View>
                  ))}
                </View>
              </ChartCard>
            )}

            {channels.length > 0 && (
              <ChartCard title="Traffic Channels">
                {channels.map((c, i) => (
                  <BarRow
                    key={i}
                    label={c.sessionDefaultChannelGroup || 'Unknown'}
                    value={c.sessions || c.activeUsers || 0}
                    max={maxChannel}
                    color={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                  />
                ))}
              </ChartCard>
            )}

            {countries.length > 0 && (
              <ChartCard title="Top Countries">
                {countries.map((c, i) => (
                  <BarRow key={i} label={c.country || 'Unknown'} value={c.activeUsers} max={maxCountry} color={ACCENT} />
                ))}
              </ChartCard>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </GestureHandlerRootView>
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
  sectionDivider: {
    color: C.dimmed, fontSize: 10.5, fontFamily: FONTS.bold, textTransform: 'uppercase',
    letterSpacing: 1.2, marginTop: 18, marginBottom: 10,
  },
  rangeCaption: { color: C.dimmed, fontSize: 10.5, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: C.muted, fontSize: 11, fontFamily: FONTS.regular },
  tooltip: {
    backgroundColor: C.text, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'flex-start', justifyContent: 'center',
  },
  tooltipLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontFamily: FONTS.semi, marginBottom: 2 },
  tooltipText: { color: '#fff', fontSize: 10.5, fontFamily: FONTS.semi },
  pieWrap: { alignItems: 'center', paddingVertical: 8 },
  legend: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  legendItem2: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLabel2: { color: C.muted, fontSize: 11, fontFamily: FONTS.regular, textTransform: 'capitalize' },
  legendVal: { fontFamily: FONTS.bold, fontSize: 12 },
  barRow: { paddingVertical: 6 },
  barRowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  barRowLabel: { flex: 1, color: C.body, fontSize: 11.5, fontFamily: FONTS.regular, lineHeight: 15 },
  barRowTrack: { height: 6, borderRadius: 99, backgroundColor: C.border, overflow: 'hidden' },
  barRowFill: { height: '100%', borderRadius: 99 },
  barRowVal: { color: C.text, fontSize: 11.5, fontFamily: FONTS.bold, flexShrink: 0 },
});
