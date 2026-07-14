import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-gifted-charts';
import { getSEICEvents, getSEICSponsors } from '../services/api';
import { C, FONTS } from '../theme';
import ChartCard from '../components/ChartCard';
import ScreenHeader from '../components/ScreenHeader';

const LOGO = require('../../assets/seic.png');

const PAD = 18;
const ACCENT = '#7c3aed';

const fmt = (n) => {
  if (n === undefined || n === null || n === '') return '—';
  const v = parseFloat(n);
  if (isNaN(v)) return '—';
  return Math.round(v).toLocaleString('en-IN');
};

const fmtINR = (n) => {
  const v = parseFloat(n) || 0;
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '₹' + (v / 100000).toFixed(2) + ' L';
  if (v >= 1000) return '₹' + (v / 1000).toFixed(1) + 'K';
  return '₹' + Math.round(v).toLocaleString('en-IN');
};

const fmtDate = (s) => {
  if (!s) return '';
  const p = s.split('-');
  if (p.length === 3) return `${p[2]}-${p[1]}-${p[0].slice(-2)}`;
  return s;
};

const CATEGORY_COLORS = {
  Title:     '#7c3aed',
  Exclusive: '#0b6e6e',
  Platinum:  '#475569',
  Gold:      '#b45309',
  Silver:    '#64748b',
};

const KPI_TILES = [
  { key: 'total_sponsors',          label: 'Total Sponsors',      colors: ['#3b82f6', '#1d4ed8'] },
  { key: 'award_records',           label: 'Award Records',       colors: ['#f59e0b', '#d97706'] },
  { key: 'ministerial_speakers',    label: 'Ministerial Speakers',colors: ['#8b5cf6', '#7c3aed'] },
  { key: 'curated_speakers',        label: 'Curated Speakers',    colors: ['#10b981', '#059669'] },
  { key: 'speaker_tracker',         label: 'Speaker Tracker',     colors: ['#ef4444', '#dc2626'] },
  { key: 'booths_assigned',         label: 'Booths Assigned',     colors: ['#6366f1', '#4f46e5'] },
  { key: 'total_passes',            label: 'Total Passes',        colors: ['#ec4899', '#db2777'] },
  { key: 'sugar_networking_passes', label: 'SND Passes',          colors: ['#14b8a6', '#0d9488'] },
];

function CategoryBadge({ name }) {
  const color = CATEGORY_COLORS[name] || '#64748b';
  return (
    <View style={[styles.catBadge, { backgroundColor: color + '18', borderColor: color + '55' }]}>
      <Text style={[styles.catBadgeText, { color }]}>{name || '—'}</Text>
    </View>
  );
}

export default function SEICScreen({ navigation }) {
  const { width: SW } = useWindowDimensions();
  const kpiTileWidth = (SW - PAD * 2 - 8) / 2;

  const [events, setEvents]             = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [statsData, setStatsData]       = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    setLoadingEvents(true);
    getSEICEvents()
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        const sorted = [...list].sort((a, b) => b.EventMasterId - a.EventMasterId);
        setEvents(sorted);
        if (sorted.length > 0) setSelectedEvent(sorted[0]);
      })
      .catch(e => setError(e.message || 'Failed to load events'))
      .finally(() => setLoadingEvents(false));
  }, []);

  const fetchStats = useCallback((eventCode) => {
    if (!eventCode) return;
    setLoadingStats(true);
    setError(null);
    getSEICSponsors(eventCode)
      .then(res => {
        const d = res.data;
        if (d && d.success) {
          setStatsData(d.data || null);
        } else {
          setStatsData(null);
          setError('API returned failure');
        }
      })
      .catch(e => setError(e.response?.data?.error || e.message || 'Failed to load stats'))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchStats(selectedEvent.EventMasterId);
  }, [selectedEvent, fetchStats]);

  const {
    stats = {}, sponsor_details = [],
    passes_data = {}, amount_summary = {},
  } = statsData || {};

  const confirmedCount = sponsor_details.filter(s => s.Approval_Received === 'Y').length;
  const pendingCount = sponsor_details.filter(s => s.Approval_Received !== 'Y').length;

  const statusPie = [
    { value: confirmedCount || 0.001, color: '#22c55e', label: 'Confirmed' },
    { value: pendingCount || 0.001,   color: '#f59e0b', label: 'Pending' },
  ];

  const top5 = [...sponsor_details]
    .filter(s => s.Sponsorship_Amount > 0)
    .sort((a, b) => b.Sponsorship_Amount - a.Sponsorship_Amount)
    .slice(0, 5);

  const bd = passes_data.breakdown || {};
  const passGroups = [
    {
      label: 'SPONSOR PASSES', total: bd.sponsor_grand_total || 0, color: '#3b82f6',
      sub: [
        { label: 'With Stay (Double Occ.)', val: bd.sponsor_total_elite || 0 },
        { label: 'Without Stay',            val: bd.sponsor_total_corporate || 0 },
        { label: 'With Stay (Single Occ.)', val: bd.sponsor_total_visitor || 0 },
      ],
    },
    {
      label: 'NON-SPONSOR PASSES', total: bd.non_sponsor_grand_total || 0, color: '#8b5cf6',
      sub: [
        { label: 'With Stay (Double Occ.)', val: bd.non_sponsor_total_elite || 0 },
        { label: 'Without Stay',            val: bd.non_sponsor_total_corporate || 0 },
        { label: 'With Stay (Single Occ.)', val: bd.non_sponsor_total_visitor || 0 },
      ],
    },
  ];

  const amountRows = [
    { label: 'Sponsorship Amount', value: amount_summary.sponsor_amount || 0, color: '#3b82f6' },
    { label: 'Delegates Amount',   value: amount_summary.delegate_amount || 0, color: '#8b5cf6' },
    { label: 'SND Amount',         value: amount_summary.snd_amount || 0, color: '#ec4899' },
  ];

  const hasData = !!statsData;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="SEIC Conference"
        subtitle="Sugar & Ethanol India Conference"
        url="https://seic.events/"
        accent={ACCENT}
        badge="Live"
        logoSrc={LOGO}
        logoBg="#ffffff"
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Event selector */}
        {loadingEvents ? (
          <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} />
        ) : events.length > 0 ? (
          <>
            <TouchableOpacity
              style={styles.eventPicker}
              onPress={() => setShowEventPicker(v => !v)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.eventPickerLabel}>SEIC Event</Text>
                <Text style={styles.eventPickerName} numberOfLines={1}>
                  {selectedEvent?.EventMaster_Name || 'Select event…'}
                </Text>
                {selectedEvent && (
                  <Text style={styles.eventPickerDates}>
                    {fmtDate(selectedEvent.Start_Date)} → {fmtDate(selectedEvent.End_Date)}
                  </Text>
                )}
              </View>
              {loadingStats && <ActivityIndicator color={ACCENT} size="small" style={{ marginRight: 8 }} />}
              <Text style={[styles.pickerChevron, { color: ACCENT }]}>{showEventPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showEventPicker && (
              <View style={styles.eventDropdown}>
                {events.map(ev => (
                  <TouchableOpacity
                    key={ev.EventMasterId}
                    style={[styles.eventDropItem, selectedEvent?.EventMasterId === ev.EventMasterId && styles.eventDropItemActive]}
                    onPress={() => { setSelectedEvent(ev); setShowEventPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.eventDropName, selectedEvent?.EventMasterId === ev.EventMasterId && { color: ACCENT }]}>
                      {ev.EventMaster_Name}
                    </Text>
                    <Text style={styles.eventDropDates}>
                      {fmtDate(ev.Start_Date)} → {fmtDate(ev.End_Date)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : null}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {loadingStats ? (
          <View style={styles.loadBox}>
            <ActivityIndicator color={ACCENT} size="large" />
            <Text style={styles.loadText}>Loading SEIC data…</Text>
          </View>
        ) : hasData ? (
          <>
            {/* ── KPI tiles (2 cols) ── */}
            <View style={styles.kpiGrid}>
              {KPI_TILES.map(t => (
                <LinearGradient key={t.key} colors={t.colors} style={[styles.kpiTile, { width: kpiTileWidth }]}>
                  <Text style={styles.kpiTileValue}>{fmt(stats[t.key])}</Text>
                  <Text style={styles.kpiTileLabel}>{t.label}</Text>
                </LinearGradient>
              ))}
            </View>

            {/* ── Passes breakdown ── */}
            <ChartCard title="Passes Breakdown">
              <View style={styles.totalPassesRow}>
                <Text style={styles.totalPassesLabel}>Total Passes</Text>
                <Text style={[styles.totalPassesValue, { color: ACCENT }]}>{fmt(stats.total_passes)}</Text>
              </View>
              {passGroups.map((pr, ri) => (
                <View key={ri} style={{ marginBottom: ri === 0 ? 14 : 0 }}>
                  <View style={styles.passHeadRow}>
                    <View style={styles.passHeadLeft}>
                      <View style={[styles.passDot, { backgroundColor: pr.color }]} />
                      <Text style={[styles.passGroupLabel, { color: pr.color }]}>{pr.label}</Text>
                    </View>
                    <Text style={[styles.passGroupTotal, { color: pr.color }]}>{pr.total}</Text>
                  </View>
                  <View style={styles.passBarTrack}>
                    {pr.sub.map((s, si) => {
                      const w = pr.total > 0 ? Math.round((s.val / pr.total) * 100) : 0;
                      if (w <= 0) return null;
                      const opac = si === 0 ? 'ff' : si === 1 ? 'aa' : '66';
                      return <View key={si} style={{ width: `${w}%`, backgroundColor: pr.color + opac, height: '100%' }} />;
                    })}
                  </View>
                  {pr.sub.map((s, si) => {
                    const pct = pr.total > 0 ? Math.round((s.val / pr.total) * 100) : 0;
                    return (
                      <View key={si} style={styles.passSubRow}>
                        <Text style={styles.passSubLabel}>{s.label}</Text>
                        <Text style={styles.passSubPct}>{pct}%</Text>
                        <Text style={styles.passSubVal}>{s.val}</Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ChartCard>

            {/* ── Sponsorship status donut ── */}
            <ChartCard title="Sponsorship Status">
              <View style={styles.pieWrap}>
                <PieChart
                  data={statusPie}
                  donut
                  radius={80}
                  innerRadius={50}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: C.text, fontFamily: FONTS.bold, fontSize: 16 }}>{sponsor_details.length}</Text>
                      <Text style={{ color: C.muted, fontFamily: FONTS.regular, fontSize: 9 }}>sponsors</Text>
                    </View>
                  )}
                />
              </View>
              <View style={styles.legend}>
                {[{ label: 'Confirmed', count: confirmedCount, color: '#22c55e' }, { label: 'Pending', count: pendingCount, color: '#f59e0b' }].map(d => (
                  <View key={d.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <Text style={styles.legendLabel}>{d.label}</Text>
                    <Text style={[styles.legendVal, { color: d.color }]}>{fmt(d.count)}</Text>
                  </View>
                ))}
              </View>
            </ChartCard>

            {/* ── Amount summary ── */}
            <ChartCard title="Amount Summary">
              {amountRows.map((row, i) => {
                const pct = amount_summary.grand_total > 0 ? Math.round((row.value / amount_summary.grand_total) * 100) : 0;
                return (
                  <View key={i} style={{ marginBottom: 12 }}>
                    <View style={styles.amountRowHead}>
                      <Text style={styles.amountRowLabel}>{row.label}</Text>
                      <Text style={[styles.amountRowValue, { color: row.color }]}>{fmtINR(row.value)}</Text>
                    </View>
                    <View style={styles.amountBarTrack}>
                      <View style={[styles.amountBarFill, { width: `${Math.max(pct, row.value > 0 ? 3 : 0)}%`, backgroundColor: row.color }]} />
                    </View>
                    <Text style={styles.amountRowPct}>{pct}%</Text>
                  </View>
                );
              })}
              <View style={styles.totalAmountBox}>
                <Text style={styles.totalAmountLabel}>Total Amount</Text>
                <Text style={styles.totalAmountValue}>{fmtINR(amount_summary.grand_total)}</Text>
              </View>
            </ChartCard>

            {/* ── Top 5 sponsors ── */}
            <ChartCard title="Top 5 Sponsors" style={{ marginBottom: 12 }}>
              {top5.length > 0 ? (
                top5.map((s, i) => {
                  const pct = Math.round((s.Sponsorship_Amount / top5[0].Sponsorship_Amount) * 100);
                  return (
                    <View key={i} style={styles.top5Row}>
                      <Text style={styles.top5Rank}>{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={styles.top5HeadRow}>
                          <Text style={styles.top5Name} numberOfLines={1}>{s.Sponsor_Name}</Text>
                          <Text style={[styles.top5Amount, { color: ACCENT }]}>{fmtINR(s.Sponsorship_Amount)}</Text>
                        </View>
                        <View style={styles.top5BarTrack}>
                          <View style={[styles.top5BarFill, { width: `${pct}%`, backgroundColor: `hsl(${245 + i * 20},68%,${54 + i * 6}%)` }]} />
                        </View>
                      </View>
                      <CategoryBadge name={s.category_name} />
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noData}>No sponsor data</Text>
              )}
            </ChartCard>

            {/* ── All sponsors ── */}
            <ChartCard title={`All Sponsors (${sponsor_details.length})`}>
              {sponsor_details.length > 0 ? (
                sponsor_details.map((s, i) => (
                  <View key={i} style={styles.sponsorRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sponsorName} numberOfLines={1}>
                        {s.Sponsor_Name || `Sponsor ${i + 1}`}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <CategoryBadge name={s.category_name} />
                        {s.Contact_Person ? (
                          <Text style={styles.sponsorContact} numberOfLines={1}>{s.Contact_Person}</Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.sponsorAmt}>
                        {s.Sponsorship_Amount > 0 ? fmtINR(s.Sponsorship_Amount) : '—'}
                      </Text>
                      <Text style={[styles.sponsorPending, { color: s.Pending_Amount > 0 ? C.error : C.dimmed }]}>
                        {s.Pending_Amount > 0 ? `Pending ${fmtINR(s.Pending_Amount)}` : 'Nil pending'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>No sponsor data</Text>
              )}
            </ChartCard>
          </>
        ) : !loadingStats && !error ? (
          <Text style={styles.noData}>Select an event to load analytics.</Text>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: PAD, paddingTop: 14 },
  eventPicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.bgCard, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: `${ACCENT}44`, marginBottom: 8,
    shadowColor: '#0f1a16', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  eventPickerLabel: { color: ACCENT, fontSize: 10, fontFamily: FONTS.semi, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  eventPickerName: { color: C.text, fontSize: 15, fontFamily: FONTS.bold },
  eventPickerDates: { color: C.muted, fontSize: 11, fontFamily: FONTS.regular, marginTop: 2 },
  pickerChevron: { fontSize: 14, fontFamily: FONTS.bold },
  eventDropdown: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: `${ACCENT}33`,
    borderRadius: 12, marginBottom: 12, overflow: 'hidden',
  },
  eventDropItem: { padding: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  eventDropItemActive: { backgroundColor: `${ACCENT}12` },
  eventDropName: { color: C.text, fontFamily: FONTS.semi, fontSize: 14 },
  eventDropDates: { color: C.muted, fontFamily: FONTS.regular, fontSize: 11, marginTop: 2 },
  loadBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadText: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13 },
  errorBox: { alignItems: 'center', paddingVertical: 16 },
  errorText: { color: C.error, fontFamily: FONTS.semi, fontSize: 13, textAlign: 'center' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  kpiTile: { borderRadius: 12, padding: 12 },
  kpiTileValue: { fontFamily: FONTS.bold, fontSize: 20, color: '#fff', letterSpacing: -0.4 },
  kpiTileLabel: { fontSize: 10.5, fontFamily: FONTS.semi, textTransform: 'uppercase', letterSpacing: 0.6, color: 'rgba(255,255,255,0.85)', marginTop: 3 },

  totalPassesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  totalPassesLabel: { color: C.muted, fontSize: 11, fontFamily: FONTS.semi, textTransform: 'uppercase', letterSpacing: 0.8 },
  totalPassesValue: { fontFamily: FONTS.bold, fontSize: 22 },
  passHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  passHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  passDot: { width: 8, height: 8, borderRadius: 2 },
  passGroupLabel: { fontSize: 10.5, fontFamily: FONTS.bold, letterSpacing: 0.6 },
  passGroupTotal: { fontFamily: FONTS.bold, fontSize: 15 },
  passBarTrack: { flexDirection: 'row', height: 6, borderRadius: 99, overflow: 'hidden', backgroundColor: C.border, marginBottom: 6 },
  passSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  passSubLabel: { flex: 1, color: C.muted, fontSize: 11, fontFamily: FONTS.regular },
  passSubPct: { color: C.dimmed, fontSize: 11, fontFamily: FONTS.regular, width: 32, textAlign: 'right' },
  passSubVal: { color: C.text, fontSize: 11, fontFamily: FONTS.bold, width: 26, textAlign: 'right' },

  pieWrap: { alignItems: 'center', paddingVertical: 10 },
  legend: { marginTop: 14, gap: 8, flexDirection: 'row', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: C.text, fontFamily: FONTS.regular, fontSize: 13 },
  legendVal: { fontFamily: FONTS.bold, fontSize: 14 },

  amountRowHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  amountRowLabel: { color: C.body, fontSize: 12.5, fontFamily: FONTS.semi },
  amountRowValue: { fontSize: 12.5, fontFamily: FONTS.bold },
  amountBarTrack: { height: 6, borderRadius: 99, backgroundColor: C.border, overflow: 'hidden' },
  amountBarFill: { height: '100%', borderRadius: 99 },
  amountRowPct: { color: C.dimmed, fontSize: 10.5, fontFamily: FONTS.regular, marginTop: 2 },
  totalAmountBox: {
    backgroundColor: '#0f172a', borderRadius: 10, padding: 12, marginTop: 4,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalAmountLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 0.6 },
  totalAmountValue: { color: '#fff', fontFamily: FONTS.bold, fontSize: 15 },

  top5Row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border },
  top5Rank: { width: 16, color: C.dimmed, fontFamily: FONTS.bold, fontSize: 12, textAlign: 'right' },
  top5HeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 },
  top5Name: { flex: 1, color: C.text, fontFamily: FONTS.semi, fontSize: 13, paddingRight: 8 },
  top5Amount: { fontFamily: FONTS.bold, fontSize: 13 },
  top5BarTrack: { height: 5, borderRadius: 99, backgroundColor: C.border, overflow: 'hidden' },
  top5BarFill: { height: '100%', borderRadius: 99 },

  catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, borderWidth: 1, alignSelf: 'flex-start' },
  catBadgeText: { fontSize: 9.5, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 0.4 },

  sponsorRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sponsorName: { color: C.text, fontFamily: FONTS.semi, fontSize: 13 },
  sponsorContact: { color: C.muted, fontFamily: FONTS.regular, fontSize: 11, flexShrink: 1 },
  sponsorAmt: { fontFamily: FONTS.bold, fontSize: 13, color: C.text },
  sponsorPending: { fontSize: 10.5, fontFamily: FONTS.semi, marginTop: 2 },

  noData: { color: C.muted, fontFamily: FONTS.regular, fontSize: 13, textAlign: 'center', paddingVertical: 30 },
});
