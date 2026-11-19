import type { KpiCode, KpiStatus, PeriodFilter } from '../types/kpi';

export type KpiDirection = 'up' | 'down' | 'band';

export interface KpiChartMeta {
  dir: KpiDirection;
  ok: number | [number, number];
  warn: number | [number, number];
  monthlyDomain: [number, number];
  divisionalDomain: [number, number];
  unit: string;
  shortLabel: string;
  targetLabel: string;
}

/** Threshold, domain, and label configuration shared across dashboard charts. */
export const KPI_CHART_META: Record<KpiCode, KpiChartMeta> = {
  'KPI-1.1': {
    dir: 'up',
    ok: 1.5,
    warn: 1.1,
    monthlyDomain: [1.0, 2.6],
    divisionalDomain: [1.0, 3.0],
    unit: 'x',
    shortLabel: 'Book-to-Bill',
    targetLabel: 'Meta ≥ 1,50x',
  },
  'KPI-1.2': {
    dir: 'up',
    ok: 18.0,
    warn: 15.5,
    monthlyDomain: [12, 25],
    divisionalDomain: [10, 29],
    unit: '%',
    shortLabel: 'Margen Op.',
    targetLabel: 'Meta ≥ 18,0%',
  },
  'KPI-2.1': {
    dir: 'up',
    ok: 82.0,
    warn: 75.0,
    monthlyDomain: [70, 90],
    divisionalDomain: [72, 88],
    unit: '%',
    shortLabel: 'OEE',
    targetLabel: 'Meta ≥ 82,0%',
  },
  'KPI-2.2': {
    dir: 'up',
    ok: 95.0,
    warn: 88.0,
    monthlyDomain: [88, 100],
    divisionalDomain: [88, 100],
    unit: '%',
    shortLabel: 'Cumpl. MPS',
    targetLabel: 'Meta ≥ 95,0%',
  },
  'KPI-3.1': {
    dir: 'up',
    ok: 97.0,
    warn: 94.0,
    monthlyDomain: [94.5, 99.5],
    divisionalDomain: [94.5, 99.5],
    unit: '%',
    shortLabel: 'First-Pass Yield',
    targetLabel: 'Meta ≥ 97,0%',
  },
  'KPI-3.2': {
    dir: 'down',
    ok: 1.5,
    warn: 3.0,
    monthlyDomain: [0, 3.4],
    divisionalDomain: [0, 3.4],
    unit: '%',
    shortLabel: 'Rechazo GQAR',
    targetLabel: 'Límite ≤ 1,5%',
  },
  'KPI-4.1': {
    dir: 'band',
    ok: [65, 80],
    warn: [50, 95],
    monthlyDomain: [50, 96],
    divisionalDomain: [55, 96],
    unit: ' d',
    shortLabel: 'Días Inventario',
    targetLabel: 'Banda 65–80 d',
  },
  'KPI-4.2': {
    dir: 'up',
    ok: 94.0,
    warn: 87.0,
    monthlyDomain: [87, 98],
    divisionalDomain: [87, 98],
    unit: '%',
    shortLabel: 'Supplier OTIF',
    targetLabel: 'Meta ≥ 94,0%',
  },
  'KPI-5.1': {
    dir: 'up',
    ok: 95.0,
    warn: 85.0,
    monthlyDomain: [90, 100],
    divisionalDomain: [90, 100],
    unit: '%',
    shortLabel: 'Cierre EHS',
    targetLabel: 'Meta ≥ 95,0%',
  },
  'KPI-5.2': {
    dir: 'down',
    ok: 2.2,
    warn: 3.2,
    monthlyDomain: [1.4, 2.8],
    divisionalDomain: [1.4, 2.8],
    unit: '',
    shortLabel: 'LTIFR',
    targetLabel: 'Límite ≤ 2,20',
  },
};

export const MONTH_CORTO_LIST = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const;

export const QUARTER_SHORT_TO_PERIOD: Record<'Q1' | 'Q2' | 'Q3' | 'Q4', PeriodFilter> = {
  Q1: 'Q1 2026',
  Q2: 'Q2 2026',
  Q3: 'Q3 2026',
  Q4: 'Q4 2026',
};

export type ActiveMonthHighlight =
  | { kind: 'single'; corto: string }
  | { kind: 'range'; start: string; end: string }
  | null;

export function getStatusColorVar(status: KpiStatus): string {
  if (status === 'Óptimo') return 'var(--status-green)';
  if (status === 'Preventivo') return 'var(--status-yellow)';
  return 'var(--status-red)';
}

export function getMonthIdFromCorto(corto: string): PeriodFilter | null {
  const idx = MONTH_CORTO_LIST.indexOf(corto as (typeof MONTH_CORTO_LIST)[number]);
  if (idx < 0) return null;
  return `2026-${String(idx + 1).padStart(2, '0')}` as PeriodFilter;
}

export function getQuarterPeriodFromShort(q: string): PeriodFilter | null {
  if (q === 'Q1' || q === 'Q2' || q === 'Q3' || q === 'Q4') {
    return QUARTER_SHORT_TO_PERIOD[q];
  }
  return null;
}

export function getActiveMonthHighlight(period?: PeriodFilter): ActiveMonthHighlight {
  if (!period || period === 'FY-2026') return null;
  if (period === '9M-2026') return { kind: 'range', start: 'Ene', end: 'Sep' };
  if (period === 'Q1 2026') return { kind: 'range', start: 'Ene', end: 'Mar' };
  if (period === 'Q2 2026') return { kind: 'range', start: 'Abr', end: 'Jun' };
  if (period === 'Q3 2026') return { kind: 'range', start: 'Jul', end: 'Sep' };
  if (period === 'Q4 2026') return { kind: 'range', start: 'Oct', end: 'Dic' };
  if (period.startsWith('2026-')) {
    const idx = Number(period.slice(5)) - 1;
    const corto = MONTH_CORTO_LIST[idx];
    return corto ? { kind: 'single', corto } : null;
  }
  return null;
}

export function getActiveQuarterShort(period?: PeriodFilter): 'Q1' | 'Q2' | 'Q3' | 'Q4' | null {
  if (!period) return null;
  if (period === 'Q1 2026') return 'Q1';
  if (period === 'Q2 2026') return 'Q2';
  if (period === 'Q3 2026') return 'Q3';
  if (period === 'Q4 2026') return 'Q4';
  if (period.startsWith('2026-')) {
    const m = Number(period.slice(5));
    if (m <= 3) return 'Q1';
    if (m <= 6) return 'Q2';
    if (m <= 9) return 'Q3';
    return 'Q4';
  }
  return null;
}

export function getActivePointLabel(
  period: PeriodFilter,
  isDivisionalQuarterlyOnly: boolean
): string | null {
  if (isDivisionalQuarterlyOnly) return getActiveQuarterShort(period);
  if (period.startsWith('2026-')) {
    return MONTH_CORTO_LIST[Number(period.slice(5)) - 1] ?? null;
  }
  return null;
}

export function getSparklineDomain(code: KpiCode, values: number[]): [number, number] {
  const meta = KPI_CHART_META[code];
  const targets = Array.isArray(meta.ok) ? meta.ok : [meta.ok];
  const all = [...values, ...targets];
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const pad = Math.max((rawMax - rawMin) * 0.14, meta.dir === 'down' ? 0.15 : 0.05);
  const low = meta.dir === 'down' ? Math.max(0, rawMin - pad) : rawMin - pad;
  return [Number(low.toFixed(2)), Number((rawMax + pad).toFixed(2))];
}

export function getModalChartDomain(code: KpiCode, values: number[]): [number, number] {
  const meta = KPI_CHART_META[code];
  const bounds = Array.isArray(meta.ok) ? meta.ok : [meta.ok];
  const all = [...values, ...bounds];
  const minVal = Math.min(...all, meta.monthlyDomain[0]);
  const maxVal = Math.max(...all, meta.monthlyDomain[1]);
  return [Number(minVal.toFixed(2)), Number(maxVal.toFixed(2))];
}
