// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator,
//   TouchableOpacity, useWindowDimensions,
// } from 'react-native';
// import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
// import { getGA4 } from '../services/api';
// import { C, FONTS, RANGE_OPTIONS } from '../theme';
// import KPICard from './KPICard';
// import RangeBar from './RangeBar';
// import ChartCard from './ChartCard';
// import ScreenHeader from './ScreenHeader';

// const PAD = 18;
// const GOLD = '#c9a24b';
// const PIE_COLS = ['#013720', '#c9a24b', '#0b6e6e', '#8ad7ba', '#d8b86a', '#34b083'];
// const CHANNEL_COLORS = ['#013720', '#c9a24b', '#0b6e6e', '#8ad7ba', '#d8b86a', '#34b083', '#7c3aed', '#ec4899'];

// const LINE_SPACING = 34;
// const LINE_INITIAL_SPACING = 16;
// const lineContentWidth = (count) =>
//   LINE_INITIAL_SPACING + Math.max(count - 1, 0) * LINE_SPACING + 24;

// const fmt = (n) => {
//   if (n === undefined || n === null || n === '') return '—';
//   const v = parseFloat(n);
//   if (isNaN(v)) return '—';
//   return Math.round(v).toLocaleString('en-IN');
// };

// const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// const fmtDateFull = (d) => {
//   if (!d || d.length !== 8) return d;
//   return `${MONTHS[parseInt(d.slice(4, 6), 10) - 1]} ${d.slice(6, 8)}, ${d.slice(0, 4)}`;
// };

// // Bar chart drawn at its full content width, then placed in our own
// // horizontal ScrollView — guarantees scrolling works (not dependent on the
// // chart library's internal, less predictable scroll behavior). Its bars
// // carry no text label (see below), so there's nothing to overlap/garble.
// const BAR_SPACING = 20;
// const BAR_INITIAL_SPACING = 12;
// const barContentWidth = (count, barWidth) =>
//   BAR_INITIAL_SPACING + count * (barWidth + BAR_SPACING) + 16;

// // Full-label proportional bar row — label wraps fully, never truncated
// function BarRow({ label, value, max, color }) {
//   const pct = max > 0 ? Math.max(3, Math.round((value / max) * 100)) : 0;
//   return (
//     <View style={styles.barRow}>
//       <View style={styles.barRowHead}>
//         <Text style={styles.barRowLabel}>{label}</Text>
//         <Text style={styles.barRowVal}>{fmt(value)}</Text>
//       </View>
//       <View style={styles.barRowTrack}>
//         <View style={[styles.barRowFill, { width: `${pct}%`, backgroundColor: color }]} />
//       </View>
//     </View>
//   );
// }

// export default function GASiteScreen({ navigation, siteKey, title, subtitle, accent, url, logoSrc, logoBg }) {
//   const { width: SW } = useWindowDimensions();
//   const CHART_W = SW - PAD * 2 - 32;

//   const [range, setRange]       = useState('week');
//   const [data, setData]         = useState(null);
//   const [loading, setLoading]   = useState(false);
//   const [error, setError]       = useState(null);

//   const fetch = useCallback((r) => {
//     setLoading(true);
//     setError(null);
//     getGA4(siteKey, r)
//       .then(res => setData(res.data?.[siteKey] || null))
//       .catch(e => setError(e.message || 'Failed to load'))
//       .finally(() => setLoading(false));
//   }, [siteKey]);

//   useEffect(() => { fetch(range); }, [fetch, range]);

//   const kpi = data?.kpi || {};
//   const trend = data?.trend || [];
//   const newsroom = data?.newsroom || {};
//   const devices = data?.devices || [];
//   const channels = data?.channels || [];
//   const pages = data?.pages || [];
//   const countries = data?.countries || [];

//   const { total_published_posts = 0, languages = {}, newsTypes = {}, error: nrError } = newsroom;

//   const typeData = Object.entries(newsTypes)
//     .map(([name, count]) => ({ name, count: Number(count) || 0 }))
//     .filter((d) => d.count > 0)
//     .sort((a, b) => b.count - a.count);

//   const langData = Object.entries(languages)
//     .map(([name, val]) => ({ name, total: typeof val === 'object' ? (val.total || 0) : Number(val) || 0 }))
//     .filter((d) => d.total > 0)
//     .sort((a, b) => b.total - a.total);

//   // No text label drawn on the chart itself (that's what was causing
//   // overlapping/garbled dates) — the date is shown via the tap tooltip and
//   // a simple "start – end" range caption below the chart instead.
//   const usersLine = trend.map((t) => ({
//     value: Math.round(t.activeUsers || 0),
//     label: '',
//     dateFull: fmtDateFull(t.date),
//   }));
//   const trendRangeCaption = trend.length > 0
//     ? `${fmtDateFull(trend[0].date)} – ${fmtDateFull(trend[trend.length - 1].date)}`
//     : '';
//   const sessionsLine = trend.map((t) => ({
//     value: Math.round(t.sessions || 0),
//   }));

//   const devicePie = devices.map((d, i) => ({
//     value: Math.round(d.activeUsers || 0),
//     color: PIE_COLS[i % PIE_COLS.length],
//     label: d.deviceCategory || '',
//   }));
//   const deviceTotal = devicePie.reduce((s, d) => s + d.value, 0);

//   const maxChannel = Math.max(1, ...channels.map(c => c.sessions || c.activeUsers || 0));
//   const maxCountry = Math.max(1, ...countries.map(c => c.activeUsers || 0));
//   const maxPage = Math.max(1, ...pages.map(p => p.screenPageViews || 0));

//   const pointerConfig = {
//     pointerStripHeight: 140,
//     pointerStripColor: C.borderDef,
//     pointerStripWidth: 2,
//     pointerColor: accent,
//     radius: 5,
//     pointerLabelWidth: 130,
//     pointerLabelHeight: 64,
//     activatePointersOnLongPress: false,
//     autoAdjustPointerLabelPosition: true,
//     pointerLabelComponent: (items) => (
//       <View style={styles.tooltip}>
//         {items[0]?.dateFull ? <Text style={styles.tooltipLabel}>{items[0].dateFull}</Text> : null}
//         <Text style={styles.tooltipText}>Users: {fmt(items[0]?.value)}</Text>
//         {items[1] ? <Text style={styles.tooltipText}>Sessions: {fmt(items[1]?.value)}</Text> : null}
//       </View>
//     ),
//   };

//   return (
//     <View style={styles.root}>
//       <ScreenHeader
//         title={title}
//         subtitle={subtitle}
//         url={url}
//         accent={accent}
//         badge="Live"
//         logoSrc={logoSrc}
//         logoBg={logoBg}
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
//         <RangeBar
//           options={RANGE_OPTIONS}
//           selected={range}
//           onSelect={(r) => { setRange(r); fetch(r); }}
//           accent={accent}
//         />

//         {loading && (
//           <View style={styles.loadBox}>
//             <ActivityIndicator color={accent} size="large" />
//             <Text style={styles.loadText}>Fetching analytics…</Text>
//           </View>
//         )}

//         {error && !loading && (
//           <View style={styles.errorBox}>
//             <Text style={styles.errorText}>⚠ {error}</Text>
//             <TouchableOpacity onPress={() => fetch(range)} style={[styles.retryBtn, { borderColor: accent }]}>
//               <Text style={[styles.retryText, { color: accent }]}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {!loading && !error && data && (
//           <>
//             {/* ── KPI Grid (3 cols) ── */}
//             <View style={styles.kpiRow}>
//               <KPICard label="Active Users" value={fmt(kpi.activeUsers)} accent={accent} />
//               <KPICard label="Page Views"   value={fmt(kpi.screenPageViews)} accent={accent} />
//               <KPICard label="New Users"    value={fmt(kpi.newUsers)} accent={accent} />
//             </View>

//             {/* ── 30-Day Traffic Trend — area chart with tap tooltip ── */}
//             <ChartCard title="30-Day Traffic Trend" style={{ marginTop: 2 }}>
//        {usersLine.length > 0 ? (
//   <>
//     <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: CHART_W }}>
//       <LineChart
//         data={usersLine}
//         data2={sessionsLine}
//         width={lineContentWidth(usersLine.length)}
//         height={170}
//         areaChart
//         startFillColor={accent}
//         endFillColor={accent}
//         startOpacity={0.2}
//         endOpacity={0.02}
//         color={accent}
//         color2={GOLD}
//         thickness={2.2}
//         thickness2={1.8}
//         curved
//         spacing={LINE_SPACING}
//         initialSpacing={LINE_INITIAL_SPACING}
//         hideDataPoints={usersLine.length > 10}
//         dataPointsColor={accent}
//         dataPointsColor2={GOLD}
//         dataPointsRadius={3}
//         xAxisLabelTextStyle={{ color: 'transparent', fontSize: 1 }}
//         yAxisTextStyle={{ color: C.dimmed, fontSize: 9, fontFamily: FONTS.regular }}
//         xAxisColor={C.borderDef}
//         yAxisColor={C.borderDef}
//         rulesColor={C.border}
//         backgroundColor="transparent"
//         noOfSections={4}
//         formatYLabel={(v) => {
//           const n = parseFloat(v);
//           if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
//           return String(Math.round(n));
//         }}
//         pointerConfig={pointerConfig}
//       />
//     </ScrollView>
//     <Text style={styles.rangeCaption}>{trendRangeCaption} · swipe to see all days · tap for exact values</Text>
//   </>
// ) : (
//   <Text style={styles.noData}>No trend data</Text>
// )}
//               <View style={styles.legendRow}>
//                 <View style={styles.legendItem}>
//                   <View style={[styles.legendDot, { backgroundColor: accent }]} />
//                   <Text style={styles.legendLabel}>Active Users</Text>
//                 </View>
//                 <View style={styles.legendItem}>
//                   <View style={[styles.legendDot, { backgroundColor: GOLD }]} />
//                   <Text style={styles.legendLabel}>Sessions</Text>
//                 </View>
//               </View>
//             </ChartCard>

//             {/* ── Newsroom summary bar ── */}
//             {!nrError && total_published_posts > 0 && (
//               <View style={[styles.newsroomBar, { borderLeftColor: accent }]}>
//                 <Text style={styles.newsroomTitle}>Newsroom</Text>
//                 <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
//                   <Text style={[styles.newsroomCount, { color: accent }]}>{fmt(total_published_posts)}</Text>
//                   <Text style={styles.newsroomSub}>posts published</Text>
//                 </View>
//                 <View style={styles.newsroomTypes}>
//                   {typeData.slice(0, 5).map((t, i) => (
//                     <View key={i} style={styles.newsroomType}>
//                       <Text style={[styles.newsroomTypeVal, { color: PIE_COLS[i % PIE_COLS.length] }]}>{t.count}</Text>
//                       <Text style={styles.newsroomTypeLabel}>{t.name}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             )}
//             {nrError && (
//               <View style={styles.warnBox}>
//                 <Text style={styles.warnText}>⚠ Newsroom API error: {nrError}</Text>
//               </View>
//             )}

//             {/* ── Language Breakdown ── */}
//             {langData.length > 0 && (
//               <ChartCard title="Language Breakdown" style={{ marginTop: 4 }}>
//                 <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: CHART_W }}>
//                   <BarChart
//                     data={langData.map((d, i) => ({ value: d.total, label: '', frontColor: PIE_COLS[i % PIE_COLS.length] }))}
//                     width={barContentWidth(langData.length, 26)}
//                     height={140}
//                     barWidth={26}
//                     spacing={BAR_SPACING}
//                     initialSpacing={BAR_INITIAL_SPACING}
//                     roundedTop
//                     showValuesAsTopLabel
//                     topLabelTextStyle={{ color: C.muted, fontSize: 9, fontFamily: FONTS.semi }}
//                     hideYAxisText
//                     xAxisColor={C.borderDef}
//                     yAxisColor="transparent"
//                     rulesColor={C.border}
//                     backgroundColor="transparent"
//                     noOfSections={3}
//                     isAnimated
//                   />
//                 </ScrollView>
//                 {langData.length > 6 && <Text style={styles.scrollHint}>← swipe the chart above to see all →</Text>}
//                 <View style={{ marginTop: 10 }}>
//                   {langData.map((d, i) => (
//                     <BarRow key={d.name} label={d.name} value={d.total} max={langData[0].total} color={PIE_COLS[i % PIE_COLS.length]} />
//                   ))}
//                 </View>
//               </ChartCard>
//             )}

//             {/* ── Content Strategy ── */}
//             {typeData.length > 0 && (
//               <ChartCard title="Content Strategy">
//                 <View>
//                   {typeData.map((d, i) => (
//                     <BarRow key={d.name} label={d.name} value={d.count} max={typeData[0].count} color={PIE_COLS[i % PIE_COLS.length]} />
//                   ))}
//                 </View>
//               </ChartCard>
//             )}

//             {/* ── Top Pages ── */}
//             {pages.length > 0 && (
//               <ChartCard title="Top Pages" style={{ marginTop: 4 }}>
//                 {pages.slice(0, 8).map((p, i) => (
//                   <BarRow key={i} label={p.pageTitle || 'Untitled'} value={p.screenPageViews} max={maxPage} color={accent} />
//                 ))}
//               </ChartCard>
//             )}

//             {/* ── Device Breakdown ── */}
//             {devicePie.length > 0 && (
//               <ChartCard title="Device Breakdown" style={{ marginTop: 4 }}>
//                 <View style={styles.pieWrap}>
//                   <PieChart
//                     data={devicePie}
//                     donut
//                     radius={70}
//                     innerRadius={44}
//                     centerLabelComponent={() => (
//                       <View style={{ alignItems: 'center' }}>
//                         <Text style={{ color: C.text, fontFamily: FONTS.bold, fontSize: 15 }}>{fmt(deviceTotal)}</Text>
//                         <Text style={{ color: C.muted, fontFamily: FONTS.regular, fontSize: 9 }}>users</Text>
//                       </View>
//                     )}
//                   />
//                 </View>
//                 <View style={styles.legend}>
//                   {devicePie.map((d) => (
//                     <View key={d.label} style={styles.legendItem2}>
//                       <View style={[styles.legendDot, { backgroundColor: d.color }]} />
//                       <Text style={styles.legendLabel2}>{d.label}</Text>
//                       <Text style={[styles.legendVal, { color: d.color }]}>{fmt(d.value)}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </ChartCard>
//             )}

//             {/* ── Traffic Channels ── */}
//             {channels.length > 0 && (
//               <ChartCard title="Traffic Channels">
//                 {channels.map((c, i) => (
//                   <BarRow
//                     key={i}
//                     label={c.sessionDefaultChannelGroup || 'Unknown'}
//                     value={c.sessions || c.activeUsers || 0}
//                     max={maxChannel}
//                     color={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
//                   />
//                 ))}
//               </ChartCard>
//             )}

//             {/* ── Top Countries ── */}
//             {countries.length > 0 && (
//               <ChartCard title="Top Countries">
//                 {countries.map((c, i) => (
//                   <BarRow key={i} label={c.country || 'Unknown'} value={c.activeUsers} max={maxCountry} color={accent} />
//                 ))}
//               </ChartCard>
//             )}
//           </>
//         )}

//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: C.bg },
//   scroll: { padding: PAD, paddingTop: 14 },
//   loadBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
//   loadText: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13 },
//   errorBox: { alignItems: 'center', paddingVertical: 30, gap: 12 },
//   errorText: { color: C.error, fontFamily: FONTS.semi, fontSize: 14, textAlign: 'center' },
//   retryBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9 },
//   retryText: { fontFamily: FONTS.semi, fontSize: 14 },
//   kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
//   noData: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
//   scrollHint: { color: C.dimmed, fontSize: 10, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 4 },
//   rangeCaption: { color: C.dimmed, fontSize: 10.5, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8 },
//   legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
//   legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   legendDot: { width: 8, height: 8, borderRadius: 4 },
//   legendLabel: { color: C.muted, fontSize: 11, fontFamily: FONTS.regular },
//   newsroomBar: {
//     backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3,
//     borderRadius: 10, padding: 12, marginTop: 2,
//   },
//   newsroomTitle: { color: C.muted, fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
//   newsroomCount: { fontFamily: FONTS.bold, fontSize: 18 },
//   newsroomSub: { color: C.dimmed, fontSize: 11, fontFamily: FONTS.regular },
//   newsroomTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 },
//   newsroomType: { alignItems: 'center', minWidth: 50 },
//   newsroomTypeVal: { fontFamily: FONTS.bold, fontSize: 15 },
//   newsroomTypeLabel: { color: C.muted, fontSize: 10, fontFamily: FONTS.regular, marginTop: 2 },
//   warnBox: { backgroundColor: '#fff8f0', borderWidth: 1, borderColor: '#f5c46a', borderRadius: 10, padding: 12, marginTop: 2 },
//   warnText: { color: '#7a4a00', fontSize: 12, fontFamily: FONTS.regular },
//   tooltip: {
//     backgroundColor: C.text, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
//     alignItems: 'flex-start', justifyContent: 'center',
//   },
//   tooltipLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontFamily: FONTS.semi, marginBottom: 2 },
//   tooltipText: { color: '#fff', fontSize: 10.5, fontFamily: FONTS.semi },
//   pieWrap: { alignItems: 'center', paddingVertical: 8 },
//   legend: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
//   legendItem2: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   legendLabel2: { color: C.muted, fontSize: 11, fontFamily: FONTS.regular, textTransform: 'capitalize' },
//   legendVal: { fontFamily: FONTS.bold, fontSize: 12 },
//   barRow: { paddingVertical: 6 },
//   barRowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
//   barRowLabel: { flex: 1, color: C.body, fontSize: 11.5, fontFamily: FONTS.regular, lineHeight: 15 },
//   barRowTrack: { height: 6, borderRadius: 99, backgroundColor: C.border, overflow: 'hidden' },
//   barRowFill: { height: '100%', borderRadius: 99 },
//   barRowVal: { color: C.text, fontSize: 11.5, fontFamily: FONTS.bold, flexShrink: 0 },
// });



import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TextInput, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import {
  ScrollView, GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { getGA4 } from '../services/api';
import { C, FONTS, RANGE_OPTIONS } from '../theme';
import KPICard from './KPICard';
import RangeBar from './RangeBar';
import ChartCard from './ChartCard';
import ScreenHeader from './ScreenHeader';

const PAD = 18;
const GOLD = '#c9a24b';
const PIE_COLS = ['#013720', '#c9a24b', '#0b6e6e', '#8ad7ba', '#d8b86a', '#34b083'];
const CHANNEL_COLORS = ['#013720', '#c9a24b', '#0b6e6e', '#8ad7ba', '#d8b86a', '#34b083', '#7c3aed', '#ec4899'];

const fmt = (n) => {
  if (n === undefined || n === null || n === '') return '—';
  const v = parseFloat(n);
  if (isNaN(v)) return '—';
  return Math.round(v).toLocaleString('en-IN');
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDateFull = (d) => {
  if (!d || d.length !== 8) return d;
  return `${MONTHS[parseInt(d.slice(4, 6), 10) - 1]} ${d.slice(6, 8)}, ${d.slice(0, 4)}`;
};

const today = () => new Date().toISOString().slice(0, 10);

// Bar chart drawn at its full content width, then placed in our own
// horizontal ScrollView — guarantees scrolling works (not dependent on the
// chart library's internal, less predictable scroll behavior). Its bars
// carry no text label (see below), so there's nothing to overlap/garble.
const BAR_SPACING = 20;
const BAR_INITIAL_SPACING = 12;
const barContentWidth = (count, barWidth) =>
  BAR_INITIAL_SPACING + count * (barWidth + BAR_SPACING) + 16;

// Same idea for the line/area trend chart. `adjustToWidth` was removed on
// purpose — that prop squeezes every point into the viewport, which is
// exactly what makes a chart un-scrollable (nothing left to scroll to).
// Instead we give the chart a real content width based on point count and
// let a ScrollView pan across it.
const LINE_SPACING = 34;
const LINE_INITIAL_SPACING = 16;
const lineContentWidth = (count) =>
  LINE_INITIAL_SPACING + Math.max(count - 1, 0) * LINE_SPACING + 24;

/* ══════════════════════════════════════════════════════════════════════════
   WHY THE TREND CHART SWIPE WASN'T WORKING.

   LineChart's `pointerConfig` installs its own touch responder for the
   tap-tooltip. With `activatePointersOnLongPress: false` it claims the
   responder on touch-START, not after a hold — so it wins against a *core*
   `ScrollView` (from 'react-native') before that ScrollView's pan gesture
   ever gets a chance to activate. Every swipe attempt starting over the
   chart got eaten by the tooltip handler instead of scrolling.

   BarChart has no `pointerConfig`, so nothing competes for the touch there —
   that's why its horizontal ScrollView already worked fine.

   Fix: use react-native-gesture-handler's ScrollView for the trend chart's
   horizontal scroller. It's built on the native gesture system and
   correctly arbitrates "was this a tap (tooltip) or a pan (scroll)" against
   sibling/parent gestures. Requires the screen root to be wrapped in
   GestureHandlerRootView (done below).
   ══════════════════════════════════════════════════════════════════════════ */

// Full-label proportional bar row — label wraps fully, never truncated
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

export default function GASiteScreen({ navigation, siteKey, title, subtitle, accent, url, logoSrc, logoBg }) {
  const { width: SW } = useWindowDimensions();
  const CHART_W = SW - PAD * 2 - 32;

  const [range, setRange]       = useState('week');
  const [start, setStart]       = useState(today());
  const [end, setEnd]           = useState(today());
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetch = useCallback((r, s, e) => {
    setLoading(true);
    setError(null);
    getGA4(siteKey, r, s, e)
      .then(res => setData(res.data?.[siteKey] || null))
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [siteKey]);

  useEffect(() => { fetch(range, '', ''); }, [fetch]);

  const handleRange = (r) => {
    setRange(r);
    if (r !== 'custom') fetch(r, '', '');
  };

  const handleCustomApply = () => fetch('custom', start, end);

  const kpi = data?.kpi || {};
  const trend = data?.trend || [];
  const newsroom = data?.newsroom || {};
  const devices = data?.devices || [];
  const channels = data?.channels || [];
  const pages = data?.pages || [];
  const countries = data?.countries || [];

  const { total_published_posts = 0, languages = {}, newsTypes = {}, error: nrError } = newsroom;

  const typeData = Object.entries(newsTypes)
    .map(([name, count]) => ({ name, count: Number(count) || 0 }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const langData = Object.entries(languages)
    .map(([name, val]) => ({ name, total: typeof val === 'object' ? (val.total || 0) : Number(val) || 0 }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  // No text label drawn on the chart itself (that's what was causing
  // overlapping/garbled dates) — the date is shown via the tap tooltip and
  // a simple "start – end" range caption below the chart instead.
  const usersLine = trend.map((t) => ({
    value: Math.round(t.activeUsers || 0),
    label: '',
    dateFull: fmtDateFull(t.date),
  }));
  const trendRangeCaption = trend.length > 0
    ? `${fmtDateFull(trend[0].date)} – ${fmtDateFull(trend[trend.length - 1].date)}`
    : '';
  const sessionsLine = trend.map((t) => ({
    value: Math.round(t.sessions || 0),
  }));

  const devicePie = devices.map((d, i) => ({
    value: Math.round(d.activeUsers || 0),
    color: PIE_COLS[i % PIE_COLS.length],
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
    pointerColor: accent,
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
        title={title}
        subtitle={subtitle}
        url={url}
        accent={accent}
        badge="Live"
        logoSrc={logoSrc}
        logoBg={logoBg}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <RangeBar
          options={RANGE_OPTIONS}
          selected={range}
          onSelect={handleRange}
          accent={accent}
        />

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
            <TouchableOpacity style={[styles.applyBtn, { borderColor: accent }]} onPress={handleCustomApply} activeOpacity={0.8}>
              <Text style={[styles.applyText, { color: accent }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadBox}>
            <ActivityIndicator color={accent} size="large" />
            <Text style={styles.loadText}>Fetching analytics…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={() => fetch(range, start, end)} style={[styles.retryBtn, { borderColor: accent }]}>
              <Text style={[styles.retryText, { color: accent }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && data && (
          <>
            {/* ── KPI Grid (3 cols) ── */}
            <View style={styles.kpiRow}>
              <KPICard label="Active Users" value={fmt(kpi.activeUsers)} accent={accent} />
              <KPICard label="Page Views"   value={fmt(kpi.screenPageViews)} accent={accent} />
              <KPICard label="New Users"    value={fmt(kpi.newUsers)} accent={accent} />
            </View>

            {/* ── 30-Day Traffic Trend — area chart with tap tooltip + swipe ── */}
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
                      startFillColor={accent}
                      endFillColor={accent}
                      startOpacity={0.2}
                      endOpacity={0.02}
                      color={accent}
                      color2={GOLD}
                      thickness={2.2}
                      thickness2={1.8}
                      curved
                      spacing={LINE_SPACING}
                      initialSpacing={LINE_INITIAL_SPACING}
                      hideDataPoints={usersLine.length > 10}
                      dataPointsColor={accent}
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
                  <View style={[styles.legendDot, { backgroundColor: accent }]} />
                  <Text style={styles.legendLabel}>Active Users</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: GOLD }]} />
                  <Text style={styles.legendLabel}>Sessions</Text>
                </View>
              </View>
            </ChartCard>

            {/* ── Newsroom summary bar ── */}
            {!nrError && total_published_posts > 0 && (
              <View style={[styles.newsroomBar, { borderLeftColor: accent }]}>
                <Text style={styles.newsroomTitle}>Newsroom</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                  <Text style={[styles.newsroomCount, { color: accent }]}>{fmt(total_published_posts)}</Text>
                  <Text style={styles.newsroomSub}>posts published</Text>
                </View>
                <View style={styles.newsroomTypes}>
                  {typeData.slice(0, 5).map((t, i) => (
                    <View key={i} style={styles.newsroomType}>
                      <Text style={[styles.newsroomTypeVal, { color: PIE_COLS[i % PIE_COLS.length] }]}>{t.count}</Text>
                      <Text style={styles.newsroomTypeLabel}>{t.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {nrError && (
              <View style={styles.warnBox}>
                <Text style={styles.warnText}>⚠ Newsroom API error: {nrError}</Text>
              </View>
            )}

            {/* ── Language Breakdown ── */}
            {langData.length > 0 && (
              <ChartCard title="Language Breakdown" style={{ marginTop: 4 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: CHART_W }}>
                  <BarChart
                    data={langData.map((d, i) => ({ value: d.total, label: '', frontColor: PIE_COLS[i % PIE_COLS.length] }))}
                    width={barContentWidth(langData.length, 26)}
                    height={140}
                    barWidth={26}
                    spacing={BAR_SPACING}
                    initialSpacing={BAR_INITIAL_SPACING}
                    roundedTop
                    showValuesAsTopLabel
                    topLabelTextStyle={{ color: C.muted, fontSize: 9, fontFamily: FONTS.semi }}
                    hideYAxisText
                    xAxisColor={C.borderDef}
                    yAxisColor="transparent"
                    rulesColor={C.border}
                    backgroundColor="transparent"
                    noOfSections={3}
                    isAnimated
                  />
                </ScrollView>
                {langData.length > 6 && <Text style={styles.scrollHint}>← swipe the chart above to see all →</Text>}
                <View style={{ marginTop: 10 }}>
                  {langData.map((d, i) => (
                    <BarRow key={d.name} label={d.name} value={d.total} max={langData[0].total} color={PIE_COLS[i % PIE_COLS.length]} />
                  ))}
                </View>
              </ChartCard>
            )}

            {/* ── Content Strategy ── */}
            {typeData.length > 0 && (
              <ChartCard title="Content Strategy">
                <View>
                  {typeData.map((d, i) => (
                    <BarRow key={d.name} label={d.name} value={d.count} max={typeData[0].count} color={PIE_COLS[i % PIE_COLS.length]} />
                  ))}
                </View>
              </ChartCard>
            )}

            {/* ── Top Pages ── */}
            {pages.length > 0 && (
              <ChartCard title="Top Pages" style={{ marginTop: 4 }}>
                {pages.slice(0, 8).map((p, i) => (
                  <BarRow key={i} label={p.pageTitle || 'Untitled'} value={p.screenPageViews} max={maxPage} color={accent} />
                ))}
              </ChartCard>
            )}

            {/* ── Device Breakdown ── */}
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

            {/* ── Traffic Channels ── */}
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

            {/* ── Top Countries ── */}
            {countries.length > 0 && (
              <ChartCard title="Top Countries">
                {countries.map((c, i) => (
                  <BarRow key={i} label={c.country || 'Unknown'} value={c.activeUsers} max={maxCountry} color={accent} />
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
  customRow: { flexDirection: 'row', gap: 8, marginTop: 2, marginBottom: 6, alignItems: 'flex-end' },
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
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  noData: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  scrollHint: { color: C.dimmed, fontSize: 10, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 4 },
  rangeCaption: { color: C.dimmed, fontSize: 10.5, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: C.muted, fontSize: 11, fontFamily: FONTS.regular },
  newsroomBar: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3,
    borderRadius: 10, padding: 12, marginTop: 2,
  },
  newsroomTitle: { color: C.muted, fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  newsroomCount: { fontFamily: FONTS.bold, fontSize: 18 },
  newsroomSub: { color: C.dimmed, fontSize: 11, fontFamily: FONTS.regular },
  newsroomTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 },
  newsroomType: { alignItems: 'center', minWidth: 50 },
  newsroomTypeVal: { fontFamily: FONTS.bold, fontSize: 15 },
  newsroomTypeLabel: { color: C.muted, fontSize: 10, fontFamily: FONTS.regular, marginTop: 2 },
  warnBox: { backgroundColor: '#fff8f0', borderWidth: 1, borderColor: '#f5c46a', borderRadius: 10, padding: 12, marginTop: 2 },
  warnText: { color: '#7a4a00', fontSize: 12, fontFamily: FONTS.regular },
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