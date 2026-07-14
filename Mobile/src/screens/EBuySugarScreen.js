// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator,
//   TextInput, TouchableOpacity, useWindowDimensions,
// } from 'react-native';
// import { VictoryChart, VictoryBar, VictoryArea, VictoryScatter, VictoryAxis } from 'victory-native';
// import { getEBuySugar } from '../services/api';
// import { C, FONTS, EBS_RANGE_OPTIONS } from '../theme';
// import KPICard from '../components/KPICard';
// import RangeBar from '../components/RangeBar';
// import ChartCard from '../components/ChartCard';
// import ScreenHeader from '../components/ScreenHeader';

// const LOGO = require('../../assets/ebuysugar.png');

// const PAD = 18;
// const ACCENT = '#b45309';
// const EBS_COLS = ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#92400e', '#78350f'];

// const fmt = (n) => {
//   if (n === undefined || n === null || n === '') return '—';
//   const v = parseFloat(String(n).replace(/[₹,\s]/g, ''));
//   if (isNaN(v)) return String(n);
//   return Math.round(v).toLocaleString('en-IN');
// };

// const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// const fmtMonth = (ym) => {
//   if (!ym || ym.length < 7) return ym || '';
//   return `${MONTHS[parseInt(ym.slice(5, 7), 10) - 1]} ${ym.slice(0, 4)}`;
// };

// const parseEBS = (info = []) => {
//   const m = {};
//   info.forEach((item) => { m[item.id] = item; });
//   return {
//     filteredSaleVolumeRs:  m[4]?.count,
//     filteredSaleVolumeQtl: m[5]?.count,
//     monthlyTrades:         Array.isArray(m[10]?.count) ? m[10].count : [],
//     filteredTradesCount:   m[11]?.count,
//     filteredActiveUsers:   m[12]?.count,
//     monthlyActiveUsers:    Array.isArray(m[13]?.count) ? m[13].count : [],
//     filteredRegUsers:      m[8]?.count,
//   };
// };

// const today = () => new Date().toISOString().slice(0, 10);

// // Per-column width is generous enough that a "Jul 2025" angled label can
// // never collide with its neighbor. Chart is drawn at its true content width
// // then placed in our own horizontal ScrollView. NOTE: we deliberately do NOT
// // use VictoryVoronoiContainer here — its drag-tracking gesture claims the
// // touch before the ScrollView can, which silently breaks swiping. Tapping a
// // bar/point (a discrete press, via the `events` prop) coexists with scroll
// // gestures fine, so that's what drives the tap-to-see-values card instead.
// const ITEM_W = 64;
// const CHART_PADDING = { top: 26, bottom: 78, left: 54, right: 20 };

// const axisStyle = {
//   axis: { stroke: C.borderDef },
//   tickLabels: { fontSize: 9.5, fill: C.dimmed, fontFamily: FONTS.regular, angle: -40, textAnchor: 'end' },
//   grid: { stroke: 'transparent' },
// };
// const yAxisStyle = {
//   axis: { stroke: C.borderDef },
//   tickLabels: { fontSize: 9, fill: C.dimmed, fontFamily: FONTS.regular },
//   grid: { stroke: C.border },
// };

// // Builds the `events` prop that makes tapping a bar/point update `onSelect`
// // with that datum — a plain press, so it never competes with ScrollView pan.
// const tapEvents = (onSelect) => ([{
//   target: 'data',
//   eventHandlers: {
//     onPressIn: () => {
//       return [{
//         target: 'data',
//         mutation: (props) => { onSelect(props.datum); return null; },
//       }];
//     },
//   },
// }]);

// export default function EBuySugarScreen({ navigation }) {
//   const { width: SW } = useWindowDimensions();
//   const CHART_W = SW - PAD * 2 - 32;
//   const chartWidth = (count) => Math.max(CHART_W, count * ITEM_W + CHART_PADDING.left + CHART_PADDING.right);

//   const [range, setRange]     = useState('today');
//   const [start, setStart]     = useState(today());
//   const [end, setEnd]         = useState(today());
//   const [raw, setRaw]         = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError]     = useState(null);
//   const [selectedTrade, setSelectedTrade] = useState(null);
//   const [selectedUsers, setSelectedUsers] = useState(null);
//   const [selectedSale, setSelectedSale]   = useState(null);

//   const fetch = useCallback((r, s, e) => {
//     setLoading(true);
//     setError(null);
//     getEBuySugar(r, s, e)
//       .then(res => setRaw(res.data || null))
//       .catch(er => setError(er.message || 'Failed to load'))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => { fetch('today', '', ''); }, [fetch]);

//   const handleRange = (r) => {
//     setRange(r);
//     if (r !== 'custom') fetch(r, '', '');
//   };

//   const handleCustomApply = () => fetch('custom', start, end);

//   const parsed = raw ? parseEBS(raw.info || []) : null;

//   const tradeData = parsed
//     ? [...parsed.monthlyTrades].reverse().map((m) => ({
//         value: parseInt(m.total_trades) || 0,
//         label: fmtMonth(m.month_year),
//         qty: parseInt(m.total_qty_sold) || 0,
//         saleValueCr: parseFloat(m.total_sale_value) / 10000000,
//       }))
//     : [];

//   const saleValueData = tradeData.map((d) => ({
//     value: parseFloat(d.saleValueCr.toFixed(2)),
//     label: d.label,
//   }));

//   const usersData = parsed
//     ? [...parsed.monthlyActiveUsers].reverse().map((m, i) => ({
//         value: parseInt(m.total_active_users) || 0,
//         label: fmtMonth(m.month),
//         color: EBS_COLS[i % EBS_COLS.length],
//       }))
//     : [];

//   // Default every tap-card to the most recent month whenever fresh data arrives.
//   useEffect(() => {
//     setSelectedTrade(tradeData.length ? tradeData[tradeData.length - 1] : null);
//     setSelectedUsers(usersData.length ? usersData[usersData.length - 1] : null);
//     setSelectedSale(saleValueData.length ? saleValueData[saleValueData.length - 1] : null);
//   }, [raw]);

//   return (
//     <View style={styles.root}>
//       <ScreenHeader
//         title="eBuySugar"
//         subtitle="Online sugar trading platform"
//         url="https://www.ebuysugar.com"
//         accent={ACCENT}
//         badge="Live"
//         logoSrc={LOGO}
//         logoBg="#ffffff"
//         onBack={() => navigation.goBack()}
//       />

//       <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
//         <RangeBar options={EBS_RANGE_OPTIONS} selected={range} onSelect={handleRange} accent={ACCENT} />

//         {range === 'custom' && (
//           <View style={styles.customRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.dateLabel}>Start</Text>
//               <TextInput style={styles.dateInput} value={start} onChangeText={setStart}
//                 placeholder="YYYY-MM-DD" placeholderTextColor={C.dimmed} color={C.text} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.dateLabel}>End</Text>
//               <TextInput style={styles.dateInput} value={end} onChangeText={setEnd}
//                 placeholder="YYYY-MM-DD" placeholderTextColor={C.dimmed} color={C.text} />
//             </View>
//             <TouchableOpacity style={[styles.applyBtn, { borderColor: ACCENT }]} onPress={handleCustomApply}>
//               <Text style={[styles.applyText, { color: ACCENT }]}>Apply</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {loading && (
//           <View style={styles.loadBox}>
//             <ActivityIndicator color={ACCENT} size="large" />
//             <Text style={styles.loadText}>Loading eBuySugar data…</Text>
//           </View>
//         )}

//         {error && !loading && (
//           <View style={styles.errorBox}>
//             <Text style={styles.errorText}>⚠ {error}</Text>
//             <TouchableOpacity onPress={() => fetch(range, start, end)} style={[styles.retryBtn, { borderColor: ACCENT }]}>
//               <Text style={[styles.retryText, { color: ACCENT }]}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {!loading && !error && parsed && (
//           <>
//             {/* ── 5 KPI cards, matching web exactly ── */}
//             <View style={styles.kpiRow}>
//               <KPICard label="Sell Volume (Quintals)" value={fmt(parsed.filteredSaleVolumeQtl)} accent={ACCENT} sub="Total quintals sold in period" />
//               <KPICard label="Sale Amount (incl. GST)" value={parsed.filteredSaleVolumeRs || '—'} accent={ACCENT} sub="Total sale value with GST" />
//             </View>
//             <View style={styles.kpiRow}>
//               <KPICard label="No. of Trades" value={fmt(parsed.filteredTradesCount)} accent={ACCENT} sub="Total trades in selected period" />
//               <KPICard label="New Registered Users" value={fmt(parsed.filteredRegUsers)} accent={ACCENT} sub="New sign-ups in selected period" />
//             </View>
//             <View style={styles.kpiRow}>
//               <KPICard label="Daily Active Users" value={fmt(parsed.filteredActiveUsers)} accent={ACCENT} sub="Active users on the platform" />
//               <View style={{ flex: 1 }} />
//             </View>

//             {/* ── Monthly Trade Activity ── */}
//             <ChartCard title="Monthly Trade Activity" style={{ marginTop: 4 }}>
//               {tradeData.length > 0 ? (
//                 <>
//                   {selectedTrade && (
//                     <View style={styles.tapCard}>
//                       <Text style={styles.tapCardLabel}>{selectedTrade.label}</Text>
//                       <View style={{ flexDirection: 'row', gap: 16 }}>
//                         <Text style={styles.tapCardValue}>Trades: <Text style={{ color: ACCENT }}>{fmt(selectedTrade.value)}</Text></Text>
//                         <Text style={styles.tapCardValue}>Qty: <Text style={{ color: ACCENT }}>{fmt(selectedTrade.qty)} Qtl</Text></Text>
//                       </View>
//                     </View>
//                   )}
//                   <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: CHART_W }}>
//                     <VictoryChart width={chartWidth(tradeData.length)} height={230} domainPadding={{ x: 24 }} padding={CHART_PADDING}>
//                       <VictoryAxis style={axisStyle} />
//                       <VictoryAxis dependentAxis style={yAxisStyle} />
//                       <VictoryBar
//                         data={tradeData}
//                         x="label"
//                         y="value"
//                         cornerRadius={{ top: 4 }}
//                         barRatio={0.55}
//                         labels={({ datum }) => fmt(datum.value)}
//                         style={{
//                           data: { fill: ACCENT },
//                           labels: { fontSize: 9, fill: C.muted, fontFamily: FONTS.semi },
//                         }}
//                         events={tapEvents(setSelectedTrade)}
//                       />
//                     </VictoryChart>
//                   </ScrollView>
//                   <Text style={styles.scrollHint}>← swipe to see all months · tap a bar for exact values →</Text>
//                 </>
//               ) : <Text style={styles.noData}>No trade data available</Text>}
//             </ChartCard>

//             {/* ── Monthly Active Users ── */}
//             <ChartCard title="Monthly Active Users">
//               {usersData.length > 0 ? (
//                 <>
//                   {selectedUsers && (
//                     <View style={styles.tapCard}>
//                       <Text style={styles.tapCardLabel}>{selectedUsers.label}</Text>
//                       <Text style={styles.tapCardValue}>Active Users: <Text style={{ color: selectedUsers.color }}>{fmt(selectedUsers.value)}</Text></Text>
//                     </View>
//                   )}
//                   <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: CHART_W }}>
//                     <VictoryChart width={chartWidth(usersData.length)} height={230} domainPadding={{ x: 24 }} padding={CHART_PADDING}>
//                       <VictoryAxis style={axisStyle} />
//                       <VictoryAxis dependentAxis style={yAxisStyle} />
//                       <VictoryBar
//                         data={usersData}
//                         x="label"
//                         y="value"
//                         cornerRadius={{ top: 4 }}
//                         barRatio={0.55}
//                         labels={({ datum }) => fmt(datum.value)}
//                         style={{
//                           data: { fill: ({ datum }) => datum.color },
//                           labels: { fontSize: 9, fill: C.muted, fontFamily: FONTS.semi },
//                         }}
//                         events={tapEvents(setSelectedUsers)}
//                       />
//                     </VictoryChart>
//                   </ScrollView>
//                   <Text style={styles.scrollHint}>← swipe to see all months · tap a bar for exact values →</Text>
//                 </>
//               ) : <Text style={styles.noData}>No active users data</Text>}
//             </ChartCard>

//             {/* ── Monthly Sale Value (₹ Crore) ── */}
//             <ChartCard title="Monthly Sale Value (₹ Crore)">
//               {saleValueData.length > 0 ? (
//                 <>
//                   {selectedSale && (
//                     <View style={styles.tapCard}>
//                       <Text style={styles.tapCardLabel}>{selectedSale.label}</Text>
//                       <Text style={styles.tapCardValue}>Sale Value: <Text style={{ color: ACCENT }}>₹{selectedSale.value.toFixed(2)} Cr</Text></Text>
//                     </View>
//                   )}
//                   <ScrollView horizontal showsHorizontalScrollIndicator style={{ width: CHART_W }}>
//                     <VictoryChart width={chartWidth(saleValueData.length)} height={230} domainPadding={{ x: 20 }} padding={CHART_PADDING}>
//                       <VictoryAxis style={axisStyle} />
//                       <VictoryAxis dependentAxis tickFormat={(t) => `${t} Cr`} style={yAxisStyle} />
//                       <VictoryArea
//                         data={saleValueData}
//                         x="label"
//                         y="value"
//                         interpolation="natural"
//                         style={{ data: { fill: ACCENT, fillOpacity: 0.18, stroke: ACCENT, strokeWidth: 2.5 } }}
//                       />
//                       {/* Invisible-ish tap targets, larger than the line itself, so a
//                           single tap near any point can select it without needing to
//                           hit the 2.5px stroke exactly. */}
//                       <VictoryScatter
//                         data={saleValueData}
//                         x="label"
//                         y="value"
//                         size={9}
//                         style={{ data: { fill: ACCENT, fillOpacity: 0.001 } }}
//                         events={tapEvents(setSelectedSale)}
//                       />
//                     </VictoryChart>
//                   </ScrollView>
//                   <Text style={styles.scrollHint}>← swipe to see all months · tap a point for exact values →</Text>
//                 </>
//               ) : <Text style={styles.noData}>No sale value data</Text>}
//             </ChartCard>
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
//   customRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 6, alignItems: 'flex-end' },
//   dateLabel: { color: C.dimmed, fontSize: 10, fontFamily: FONTS.semi, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
//   dateInput: {
//     backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
//     borderRadius: 10, padding: 10, fontSize: 13, color: C.text,
//   },
//   applyBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-end' },
//   applyText: { fontFamily: FONTS.semi, fontSize: 13 },
//   loadBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
//   loadText: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13 },
//   errorBox: { alignItems: 'center', paddingVertical: 30, gap: 12 },
//   errorText: { color: C.error, fontFamily: FONTS.semi, fontSize: 14, textAlign: 'center' },
//   retryBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9 },
//   retryText: { fontFamily: FONTS.semi, fontSize: 14 },
//   kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
//   noData: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
//   scrollHint: { color: C.dimmed, fontSize: 10, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 4 },
//   tapCard: {
//     backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: ACCENT,
//     borderRadius: 10, padding: 10, marginBottom: 10,
//   },
//   tapCardLabel: { color: C.text, fontSize: 12.5, fontFamily: FONTS.bold, marginBottom: 3 },
//   tapCardValue: { color: C.muted, fontSize: 11.5, fontFamily: FONTS.semi },
// });




import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TextInput, useWindowDimensions,
} from 'react-native';
import {
  ScrollView, TouchableOpacity, GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
  VictoryChart, VictoryBar, VictoryArea, VictoryScatter, VictoryAxis, VictoryContainer,
} from 'victory-native';
import { getEBuySugar } from '../services/api';
import { C, FONTS, EBS_RANGE_OPTIONS } from '../theme';
import KPICard from '../components/KPICard';
import RangeBar from '../components/RangeBar';
import ChartCard from '../components/ChartCard';
import ScreenHeader from '../components/ScreenHeader';

const LOGO = require('../../assets/ebuysugar.png');

const PAD = 18;
// Horizontal padding *inside* ChartCard (left + right combined).
// If ChartCard's padding changes, change this number to match, or the chart
// will be wider than its clip box and the scroll will look broken.
const CARD_PAD = 32;

const ACCENT = '#b45309';
const EBS_COLS = ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#92400e', '#78350f'];

const CHART_H = 230;
const ITEM_W = 66;
const CHART_PADDING = { top: 26, bottom: 74, left: 54, right: 20 };

const fmt = (n) => {
  if (n === undefined || n === null || n === '') return '—';
  const v = parseFloat(String(n).replace(/[₹,\s]/g, ''));
  if (isNaN(v)) return String(n);
  return Math.round(v).toLocaleString('en-IN');
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Full "Feb 2025" form. Needs a steeper rotation + wider per-bar slot than the
// abbreviated form so the longer strings don't collide with each other.
const fmtMonth = (ym) => {
  if (!ym || ym.length < 7) return ym || '';
  return `${MONTHS[parseInt(ym.slice(5, 7), 10) - 1]} ${ym.slice(0, 4)}`;
};

const parseEBS = (info = []) => {
  const m = {};
  info.forEach((item) => { m[item.id] = item; });
  return {
    filteredSaleVolumeRs:  m[4]?.count,
    filteredSaleVolumeQtl: m[5]?.count,
    monthlyTrades:         Array.isArray(m[10]?.count) ? m[10].count : [],
    filteredTradesCount:   m[11]?.count,
    filteredActiveUsers:   m[12]?.count,
    monthlyActiveUsers:    Array.isArray(m[13]?.count) ? m[13].count : [],
    filteredRegUsers:      m[8]?.count,
  };
};

const today = () => new Date().toISOString().slice(0, 10);

const axisStyle = {
  axis: { stroke: C.borderDef },
  tickLabels: { fontSize: 9.5, fill: C.dimmed, fontFamily: FONTS.regular, angle: -55, textAnchor: 'end' },
  grid: { stroke: 'transparent' },
};
// Categorical (string) x-axes will sometimes have Victory auto-select a
// subset of ticks depending on available width, which reads as "labels
// missing / wrong". Passing every label in explicitly forces one tick per
// bar/point, every time, regardless of width.
const allTicks = (data) => data.map((d) => d.label);
const yAxisStyle = {
  axis: { stroke: C.borderDef },
  tickLabels: { fontSize: 9, fill: C.dimmed, fontFamily: FONTS.regular },
  grid: { stroke: C.border },
};

/* ══════════════════════════════════════════════════════════════════════════
   WHY THE SWIPE WASN'T WORKING — and what actually fixes it.

   Two separate problems were stacked on top of each other:

   1) Victory mounts its own touch responder over the chart SVG. On a phone
      that responder can win the gesture before a *plain* React Native
      ScrollView (the core `ScrollView` from 'react-native') gets a chance to
      claim it, so the swipe gets eaten. `pointerEvents="none"` on the chart
      wrapper still correctly solves this half — Victory can no longer receive
      a single touch, so it can never intercept the pan. That part was right
      and is kept below.

   2) The part that was actually breaking things: the transparent
      TouchableOpacity tap-strips were built with the CORE `TouchableOpacity`
      (from 'react-native'), which uses the old, JS-thread responder system.
      That responder system does NOT negotiate cleanly with a nested
      ScrollView the way the new gesture system does — on a real device the
      touchable claims the responder on touch-start and the parent
      ScrollView's pan never gets a chance to activate, so a horizontal swipe
      that starts on/over a bar just doesn't scroll. Since the tap-strips
      cover the *entire* plot area, effectively 100% of a swipe attempt lands
      on a touchable and gets swallowed.

   The fix: move the horizontal ScrollView AND the tap-strip TouchableOpacity
   over to react-native-gesture-handler's versions. Those are built on the
   native gesture system and correctly arbitrate "was this a tap or a pan"
   between siblings/parents — so a quick tap still fires onPress, and a drag
   is released to the ScrollView to pan. This is the standard, reliable fix
   for "chart won't swipe / touchable blocks my ScrollView" in RN.

   Requirement: react-native-gesture-handler must be installed, and your
   app's root (index.js / App.js) must be wrapped once in
   <GestureHandlerRootView style={{ flex: 1 }}>. A GestureHandlerRootView is
   also included around this screen's return value below as a safety net in
   case the app root isn't wrapped yet — wrapping twice is harmless.
   ══════════════════════════════════════════════════════════════════════════ */

// Transparent tap columns laid over the plot area, one per datum.
const TapStrips = ({ data, contentWidth, onSelect }) => {
  const plotW = contentWidth - CHART_PADDING.left - CHART_PADDING.right;
  const colW  = plotW / Math.max(data.length, 1);
  const tapH  = CHART_H - CHART_PADDING.top - CHART_PADDING.bottom;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View
        style={{
          position: 'absolute',
          left: CHART_PADDING.left,
          top: CHART_PADDING.top,
          height: tapH,
          flexDirection: 'row',
        }}
      >
        {data.map((d, i) => (
          <TouchableOpacity
            key={`${d.label}-${i}`}
            activeOpacity={1}
            delayPressIn={0}
            onPressIn={() => onSelect(d)}
            style={{ width: colW, height: tapH }}
          />
        ))}
      </View>
    </View>
  );
};

// Scrollable frame: forced content width + touch-proof chart + tap strips.
const ChartFrame = ({ viewportWidth, contentWidth, data, onSelect, children }) => (
  <ScrollView
    horizontal
    nestedScrollEnabled
    directionalLockEnabled
    bounces={false}
    showsHorizontalScrollIndicator
    keyboardShouldPersistTaps="handled"
    style={{ width: viewportWidth }}
    contentContainerStyle={{ width: contentWidth }}
  >
    <View style={{ width: contentWidth, height: CHART_H }}>
      <View pointerEvents="none" style={{ width: contentWidth, height: CHART_H }}>
        {children}
      </View>
      <TapStrips data={data} contentWidth={contentWidth} onSelect={onSelect} />
    </View>
  </ScrollView>
);

export default function EBuySugarScreen({ navigation }) {
  const { width: SW } = useWindowDimensions();
  const CHART_W = SW - PAD * 2 - CARD_PAD;
  const chartWidth = (count) =>
    Math.max(CHART_W, count * ITEM_W + CHART_PADDING.left + CHART_PADDING.right);

  const [range, setRange]     = useState('today');
  const [start, setStart]     = useState(today());
  const [end, setEnd]         = useState(today());
  const [raw, setRaw]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [selectedSale, setSelectedSale]   = useState(null);

  const fetch = useCallback((r, s, e) => {
    setLoading(true);
    setError(null);
    getEBuySugar(r, s, e)
      .then(res => setRaw(res.data || null))
      .catch(er => setError(er.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch('today', '', ''); }, [fetch]);

  const handleRange = (r) => {
    setRange(r);
    if (r !== 'custom') fetch(r, '', '');
  };

  const handleCustomApply = () => fetch('custom', start, end);

  const parsed = raw ? parseEBS(raw.info || []) : null;

const tradeData = parsed
  ? [...parsed.monthlyTrades].reverse().map((m) => ({
      value: parseInt(m.total_trades) || 0,
      label: m.month_year,           // ← was: fmtMonth(m.month_year)
      qty: parseInt(m.total_qty_sold) || 0,
      saleValueCr: parseFloat(m.total_sale_value) / 10000000,
    }))
  : [];

  const saleValueData = tradeData.map((d) => ({
    value: parseFloat(d.saleValueCr.toFixed(2)),
    label: d.label,
  }));

  const usersData = parsed
    ? [...parsed.monthlyActiveUsers].reverse().map((m, i) => ({
        value: parseInt(m.total_active_users) || 0,
        label: fmtMonth(m.month),
        color: EBS_COLS[i % EBS_COLS.length],
      }))
    : [];

  const tradeW = chartWidth(tradeData.length);
  const usersW = chartWidth(usersData.length);
  const saleW  = chartWidth(saleValueData.length);

  // Default every tap-card to the most recent month whenever fresh data arrives.
  useEffect(() => {
    setSelectedTrade(tradeData.length ? tradeData[tradeData.length - 1] : null);
    setSelectedUsers(usersData.length ? usersData[usersData.length - 1] : null);
    setSelectedSale(saleValueData.length ? saleValueData[saleValueData.length - 1] : null);
  }, [raw]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScreenHeader
        title="eBuySugar"
        subtitle="Online sugar trading platform"
        url="https://www.ebuysugar.com"
        accent={ACCENT}
        badge="Live"
        logoSrc={LOGO}
        logoBg="#ffffff"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      >
        <RangeBar options={EBS_RANGE_OPTIONS} selected={range} onSelect={handleRange} accent={ACCENT} />

        {range === 'custom' && (
          <View style={styles.customRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Start</Text>
              <TextInput style={styles.dateInput} value={start} onChangeText={setStart}
                placeholder="YYYY-MM-DD" placeholderTextColor={C.dimmed} color={C.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>End</Text>
              <TextInput style={styles.dateInput} value={end} onChangeText={setEnd}
                placeholder="YYYY-MM-DD" placeholderTextColor={C.dimmed} color={C.text} />
            </View>
            <TouchableOpacity style={[styles.applyBtn, { borderColor: ACCENT }]} onPress={handleCustomApply}>
              <Text style={[styles.applyText, { color: ACCENT }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadBox}>
            <ActivityIndicator color={ACCENT} size="large" />
            <Text style={styles.loadText}>Loading eBuySugar data…</Text>
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

        {!loading && !error && parsed && (
          <>
            {/* ── 5 KPI cards, matching web exactly ── */}
            <View style={styles.kpiRow}>
              <KPICard label="Sell Volume (Quintals)" value={fmt(parsed.filteredSaleVolumeQtl)} accent={ACCENT} sub="Total quintals sold in period" />
              <KPICard label="Sale Amount (incl. GST)" value={parsed.filteredSaleVolumeRs || '—'} accent={ACCENT} sub="Total sale value with GST" />
            </View>
            <View style={styles.kpiRow}>
              <KPICard label="No. of Trades" value={fmt(parsed.filteredTradesCount)} accent={ACCENT} sub="Total trades in selected period" />
              <KPICard label="New Registered Users" value={fmt(parsed.filteredRegUsers)} accent={ACCENT} sub="New sign-ups in selected period" />
            </View>
            <View style={styles.kpiRow}>
              <KPICard label="Daily Active Users" value={fmt(parsed.filteredActiveUsers)} accent={ACCENT} sub="Active users on the platform" />
              <View style={{ flex: 1 }} />
            </View>

            {/* ── Monthly Trade Activity ── */}
            <ChartCard title="Monthly Trade Activity" style={{ marginTop: 4 }}>
              {tradeData.length > 0 ? (
                <>
                  {selectedTrade && (
                    <View style={styles.tapCard}>
                      <Text style={styles.tapCardLabel}>{selectedTrade.label}</Text>
                      <View style={{ flexDirection: 'row', gap: 16 }}>
                        <Text style={styles.tapCardValue}>Trades: <Text style={{ color: ACCENT }}>{fmt(selectedTrade.value)}</Text></Text>
                        <Text style={styles.tapCardValue}>Qty: <Text style={{ color: ACCENT }}>{fmt(selectedTrade.qty)} Qtl</Text></Text>
                      </View>
                    </View>
                  )}
                  <ChartFrame
                    viewportWidth={CHART_W}
                    contentWidth={tradeW}
                    data={tradeData}
                    onSelect={setSelectedTrade}
                  >
                    <VictoryChart
                      width={tradeW}
                      height={CHART_H}
                      domainPadding={{ x: 24 }}
                      padding={CHART_PADDING}
                      containerComponent={<VictoryContainer responsive={false} />}
                    >
                      <VictoryAxis style={axisStyle} tickValues={allTicks(tradeData)} />
                      <VictoryAxis dependentAxis style={yAxisStyle} />
                      <VictoryBar
                        data={tradeData}
                        x="label"
                        y="value"
                        cornerRadius={{ top: 4 }}
                        barRatio={0.55}
                        labels={({ datum }) => fmt(datum.value)}
                        style={{
                          data: { fill: ACCENT },
                          labels: { fontSize: 9, fill: C.muted, fontFamily: FONTS.semi },
                        }}
                      />
                    </VictoryChart>
                  </ChartFrame>
                  <Text style={styles.scrollHint}>← swipe to see all months · tap a bar for exact values →</Text>
                </>
              ) : <Text style={styles.noData}>No trade data available</Text>}
            </ChartCard>

            {/* ── Monthly Active Users ── */}
            <ChartCard title="Monthly Active Users">
              {usersData.length > 0 ? (
                <>
                  {selectedUsers && (
                    <View style={styles.tapCard}>
                      <Text style={styles.tapCardLabel}>{selectedUsers.label}</Text>
                      <Text style={styles.tapCardValue}>Active Users: <Text style={{ color: selectedUsers.color }}>{fmt(selectedUsers.value)}</Text></Text>
                    </View>
                  )}
                  <ChartFrame
                    viewportWidth={CHART_W}
                    contentWidth={usersW}
                    data={usersData}
                    onSelect={setSelectedUsers}
                  >
                    <VictoryChart
                      width={usersW}
                      height={CHART_H}
                      domainPadding={{ x: 24 }}
                      padding={CHART_PADDING}
                      containerComponent={<VictoryContainer responsive={false} />}
                    >
                      <VictoryAxis style={axisStyle} tickValues={allTicks(usersData)} />
                      <VictoryAxis dependentAxis style={yAxisStyle} />
                      <VictoryBar
                        data={usersData}
                        x="label"
                        y="value"
                        cornerRadius={{ top: 4 }}
                        barRatio={0.55}
                        labels={({ datum }) => fmt(datum.value)}
                        style={{
                          data: { fill: ({ datum }) => datum.color },
                          labels: { fontSize: 9, fill: C.muted, fontFamily: FONTS.semi },
                        }}
                      />
                    </VictoryChart>
                  </ChartFrame>
                  <Text style={styles.scrollHint}>← swipe to see all months · tap a bar for exact values →</Text>
                </>
              ) : <Text style={styles.noData}>No active users data</Text>}
            </ChartCard>

            {/* ── Monthly Sale Value (₹ Crore) ── */}
            <ChartCard title="Monthly Sale Value (₹ Crore)">
              {saleValueData.length > 0 ? (
                <>
                  {selectedSale && (
                    <View style={styles.tapCard}>
                      <Text style={styles.tapCardLabel}>{selectedSale.label}</Text>
                      <Text style={styles.tapCardValue}>Sale Value: <Text style={{ color: ACCENT }}>₹{selectedSale.value.toFixed(2)} Cr</Text></Text>
                    </View>
                  )}
                  <ChartFrame
                    viewportWidth={CHART_W}
                    contentWidth={saleW}
                    data={saleValueData}
                    onSelect={setSelectedSale}
                  >
                    <VictoryChart
                      width={saleW}
                      height={CHART_H}
                      domainPadding={{ x: 30 }}
                      padding={CHART_PADDING}
                      containerComponent={<VictoryContainer responsive={false} />}
                    >
                      <VictoryAxis style={axisStyle} tickValues={allTicks(saleValueData)} />
                      <VictoryAxis dependentAxis tickFormat={(t) => `${t} Cr`} style={yAxisStyle} />
                      <VictoryArea
                        data={saleValueData}
                        x="label"
                        y="value"
                        interpolation="monotoneX"
                        style={{ data: { fill: ACCENT, fillOpacity: 0.18, stroke: ACCENT, strokeWidth: 2.5 } }}
                      />
                      {/* Only the selected/tapped month gets a dot — a clean,
                          uncluttered curve otherwise, matching the web chart. */}
                      {selectedSale && (
                        <VictoryScatter
                          data={saleValueData.filter((d) => d.label === selectedSale.label)}
                          x="label"
                          y="value"
                          size={4}
                          style={{ data: { fill: ACCENT, stroke: '#fff', strokeWidth: 1.5 } }}
                        />
                      )}
                    </VictoryChart>
                  </ChartFrame>
                  <Text style={styles.scrollHint}>← swipe to see all months · tap a point for exact values →</Text>
                </>
              ) : <Text style={styles.noData}>No sale value data</Text>}
            </ChartCard>
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
  applyBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-end' },
  applyText: { fontFamily: FONTS.semi, fontSize: 13 },
  loadBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadText: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13 },
  errorBox: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  errorText: { color: C.error, fontFamily: FONTS.semi, fontSize: 14, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9 },
  retryText: { fontFamily: FONTS.semi, fontSize: 14 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  noData: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  scrollHint: { color: C.dimmed, fontSize: 10, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 4 },
  tapCard: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderLeftColor: ACCENT,
    borderRadius: 10, padding: 10, marginBottom: 10,
  },
  tapCardLabel: { color: C.text, fontSize: 12.5, fontFamily: FONTS.bold, marginBottom: 3 },
  tapCardValue: { color: C.muted, fontSize: 11.5, fontFamily: FONTS.semi },
});