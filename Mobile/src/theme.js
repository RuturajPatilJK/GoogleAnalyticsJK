export const C = {
  // surfaces
  bg:        '#fcfaf4',              // ivory-50 · page background
  bgCard:    '#ffffff',              // white · card background
  surface:   '#f7f1e4',              // ivory-100 · sunken panel
  border:    '#efe6d2',              // ivory-200 · subtle border
  borderDef: '#d6dbd7',              // ink-200 · default border

  // text
  text:      '#0a1310',              // ink-950 · strong text
  body:      '#1b2723',              // ink-800 · body text
  muted:     '#647069',              // ink-500 · muted text
  dimmed:    '#8b958f',              // ink-400 · subtle text

  // brand
  accent:    '#c9a24b',              // gold-500
  green:     '#0e5e40',              // emerald-600
  emerald:   '#013720',              // emerald-800
  error:     '#dc2626',
  success:   '#16a34a',
};

export const FONTS = {
  regular:  'Signika_400Regular',
  semi:     'Signika_600SemiBold',
  bold:     'Signika_700Bold',
};

// Accent colors matched to the web dashboard (web.jsx) per section
export const SECTION_COLORS = {
  ebuysugar:    { accent: '#b45309' },  // EBS_ACC
  chinimandi:   { accent: '#16a34a' },  // CM_ACC
  bioenergy:    { accent: '#0b6e6e' },  // BE_ACC
  agriinsights: { accent: '#16a34a' },  // AI_GREEN
  seic:         { accent: '#7c3aed' },  // SEIC_ACC
};

export const RANGE_OPTIONS = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week',      label: '7 Days' },
  { key: 'month',     label: '30 Days' },
  { key: 'year',      label: 'Year' },
  { key: 'custom',    label: 'Custom' },
];

export const EBS_RANGE_OPTIONS = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '1_month',   label: '1 Month' },
  { key: '3_month',   label: '3 Months' },
  { key: 'yearly',    label: 'Yearly' },
  { key: 'custom',    label: 'Custom' },
];

export const AI_RANGE_OPTIONS = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week',      label: 'Week' },
  { key: 'year',      label: 'Year' },
  { key: 'custom',    label: 'Custom' },
];
