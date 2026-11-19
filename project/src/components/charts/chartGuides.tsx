import type { ReactElement } from 'react';
import { ReferenceArea, ReferenceLine } from 'recharts';
import type { KpiCode, PeriodFilter } from '../../types/kpi';
import {
  getActiveMonthHighlight,
  getStatusColorVar,
  KPI_CHART_META,
} from '../../utils/chartConfig';
import { evaluateStatus } from '../../utils/kpiEngine';

export const TOOLTIP_STYLE = {
  backgroundColor: 'var(--tooltip-bg)',
  borderColor: 'var(--tooltip-border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '12px',
};

interface MonthlyGuideOptions {
  period?: PeriodFilter;
  yAxisId?: string;
  includeForecast?: boolean;
}

/** Build ReferenceArea / ReferenceLine elements for Oct-Dic forecast and active period filter. */
export function buildMonthlyGuideElements({
  period,
  yAxisId,
  includeForecast = true,
}: MonthlyGuideOptions): ReactElement[] {
  const items: ReactElement[] = [];
  const axisProps = yAxisId ? { yAxisId } : {};

  if (includeForecast) {
    items.push(
      <ReferenceArea
        key="guide-forecast-band"
        {...axisProps}
        x1="Oct"
        x2="Dic"
        fill="var(--accent-blue)"
        fillOpacity={0.055}
      />,
      <ReferenceLine
        key="guide-forecast-split"
        {...axisProps}
        x="Oct"
        stroke="var(--text-muted)"
        strokeDasharray="3 3"
        strokeOpacity={0.65}
        label={{
          value: 'Proy. Q4',
          fill: 'var(--text-muted)',
          fontSize: 10,
          position: 'insideTopRight',
        }}
      />
    );
  }

  const hl = getActiveMonthHighlight(period);
  if (hl?.kind === 'range') {
    items.push(
      <ReferenceArea
        key="guide-active-range"
        {...axisProps}
        x1={hl.start}
        x2={hl.end}
        fill="var(--accent-blue)"
        fillOpacity={0.08}
        stroke="var(--accent-blue)"
        strokeOpacity={0.25}
      />
    );
  } else if (hl?.kind === 'single') {
    items.push(
      <ReferenceLine
        key="guide-active-month"
        {...axisProps}
        x={hl.corto}
        stroke="var(--accent-blue)"
        strokeWidth={2}
        strokeOpacity={0.7}
      />
    );
  }

  return items;
}

/** Build subtle optimal zone shading + SMART target reference lines for a KPI axis. */
export function buildKpiThresholdElements(
  code: KpiCode,
  domain: [number, number],
  options: { yAxisId?: string; showLabels?: boolean } = {}
): ReactElement[] {
  const meta = KPI_CHART_META[code];
  const { yAxisId, showLabels = true } = options;
  const axisProps = yAxisId ? { yAxisId } : {};
  const [domMin, domMax] = domain;

  if (meta.dir === 'band' && Array.isArray(meta.ok) && Array.isArray(meta.warn)) {
    const [okLo, okHi] = meta.ok;
    const [wLo, wHi] = meta.warn;
    return [
      <ReferenceArea
        key={`band-ok-${code}`}
        {...axisProps}
        y1={Math.max(domMin, okLo)}
        y2={Math.min(domMax, okHi)}
        fill="var(--status-green)"
        fillOpacity={0.09}
      />,
      <ReferenceArea
        key={`band-warn-hi-${code}`}
        {...axisProps}
        y1={Math.max(domMin, okHi)}
        y2={Math.min(domMax, wHi)}
        fill="var(--status-yellow)"
        fillOpacity={0.05}
      />,
      <ReferenceArea
        key={`band-warn-lo-${code}`}
        {...axisProps}
        y1={Math.max(domMin, wLo)}
        y2={Math.min(domMax, okLo)}
        fill="var(--status-yellow)"
        fillOpacity={0.05}
      />,
      <ReferenceLine
        key={`line-hi-${code}`}
        {...axisProps}
        y={okHi}
        stroke="var(--status-green)"
        strokeDasharray="4 4"
        label={
          showLabels
            ? { value: 'Máx 80 d', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideTopRight' }
            : undefined
        }
      />,
      <ReferenceLine
        key={`line-lo-${code}`}
        {...axisProps}
        y={okLo}
        stroke="var(--status-green)"
        strokeDasharray="4 4"
        label={
          showLabels
            ? { value: 'Mín 65 d', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideBottomRight' }
            : undefined
        }
      />,
    ];
  }

  const target = meta.ok as number;
  const okBandY1 = meta.dir === 'up' ? Math.max(domMin, target) : domMin;
  const okBandY2 = meta.dir === 'up' ? domMax : Math.min(domMax, target);

  return [
    <ReferenceArea
      key={`zone-ok-${code}`}
      {...axisProps}
      y1={okBandY1}
      y2={okBandY2}
      fill="var(--status-green)"
      fillOpacity={0.055}
    />,
    <ReferenceLine
      key={`line-target-${code}`}
      {...axisProps}
      y={target}
      stroke={meta.dir === 'down' ? 'var(--status-red)' : 'var(--status-green)'}
      strokeDasharray="4 4"
      label={
        showLabels
          ? {
              value: meta.targetLabel,
              fill: meta.dir === 'down' ? 'var(--status-red-text)' : 'var(--status-green-text)',
              fontSize: 10,
              fontWeight: 600,
              position: meta.dir === 'down' ? 'insideBottomRight' : 'insideBottomLeft',
            }
          : undefined
      }
    />,
  ];
}

interface DotRenderProps {
  cx?: number;
  cy?: number;
  value?: unknown;
  index?: number;
  payload?: { label?: string; mes?: string };
}

/** Create a Recharts dot renderer tinted by KPI semaphore status, emphasizing the active point. */
export function makeSemaphoreDot(
  code: KpiCode,
  activeHighlight: ReturnType<typeof getActiveMonthHighlight> | string | null,
  seriesPrefix: string
) {
  return function renderDot(props: DotRenderProps): ReactElement {
    const { cx, cy, value, index, payload } = props;
    if (cx == null || cy == null || typeof value !== 'number') {
      return <g key={`empty-${seriesPrefix}-${index ?? 0}`} />;
    }
    const status = evaluateStatus(code, value);
    const fill = getStatusColorVar(status);
    const ptLabel = payload?.mes ?? payload?.label;
    const isActive =
      typeof activeHighlight === 'string'
        ? ptLabel === activeHighlight
        : activeHighlight?.kind === 'single' && ptLabel === activeHighlight.corto;

    return (
      <circle
        key={`dot-${seriesPrefix}-${ptLabel ?? index ?? cx}`}
        cx={cx}
        cy={cy}
        r={isActive ? 5.5 : 3.5}
        fill={fill}
        stroke="var(--bg-surface)"
        strokeWidth={isActive ? 2.2 : 1.5}
      />
    );
  };
}
