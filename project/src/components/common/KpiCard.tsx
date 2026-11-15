import { AlertCircle, ArrowUpRight, FileText, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatKpiValue } from '../../utils/formatters';
import type { EvaluatedKpi } from '../../types/kpi';
import { getStatusVars, StatusBadge, TypologyBadge } from './StatusBadge';

interface KpiCardProps {
  kpi: EvaluatedKpi;
  onInspect: (kpi: EvaluatedKpi) => void;
  onDrillSector?: () => void;
  highlighted?: boolean;
}

function formatTargetSymbol(meta: string): string {
  return meta.replace('>=', '≥').replace('<=', '≤');
}

export function KpiCard({ kpi, onInspect, onDrillSector, highlighted = false }: KpiCardProps) {
  const sv = getStatusVars(kpi.status);
  const gradientId = `spark-${kpi.meta.codigo.replace('.', '-')}`;
  const isPositiveCapexAlert = kpi.status === 'Óptimo' && Boolean(kpi.advisoryNote);
  const protocolSummary = kpi.advisoryNote ?? kpi.meta.protocolo;

  return (
    <article
      className="rhm-card relative flex flex-col justify-between rounded-xl p-4"
      style={
        highlighted
          ? { borderLeftWidth: '3px', borderLeftColor: 'var(--accent-blue)' }
          : undefined
      }
    >
      <div>
        {/* Top Row: Code + Typology + Desaturated Semaphore */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span
              className="font-mono-num font-semibold"
              style={{ color: 'var(--accent-blue)' }}
            >
              {kpi.meta.codigo}
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <TypologyBadge isLeading={kpi.meta.isLeading} />
          </div>
          <StatusBadge status={kpi.status} />
        </div>

        {/* KPI Title */}
        <h4
          className="mt-2 text-[13px] font-semibold leading-snug text-[var(--text-primary)]"
          title={`Responsable: ${kpi.meta.responsable}`}
        >
          {kpi.meta.nombre}
        </h4>

        {/* Main Metric + Neutral Sparkline */}
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono-num text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-[22px]">
              {kpi.formattedValue}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px]">
              <span className="text-[var(--text-muted)]">
                Meta{' '}
                <span className="font-mono-num text-[var(--text-secondary)]">
                  {formatTargetSymbol(kpi.meta.meta)}
                </span>
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="font-mono-num font-medium" style={{ color: sv.text }}>
                {kpi.deltaLabel}
              </span>
            </div>
          </div>

          <div className="h-9 w-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpi.trendSeries} margin={{ top: 3, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    borderColor: 'var(--tooltip-border)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '4px 8px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(v) => [formatKpiValue(kpi.meta.codigo, Number(v)), kpi.meta.codigo]}
                  labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--text-muted)"
                  strokeWidth={1.5}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hairline Progress Bar (RF-01) */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="text-[var(--text-muted)]">Cumplimiento</span>
            <span className="font-mono-num font-medium text-[var(--text-secondary)]">
              {kpi.compliancePct.toFixed(1)}%
            </span>
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--bg-subtle)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(4, kpi.compliancePct))}%`,
                backgroundColor: sv.color,
              }}
            />
          </div>
        </div>

        {/* Brief Action / Alert Badge so deviations & CapEx triggers explain themselves at a glance */}
        {kpi.protocolTriggered && (
          <div
            className="mt-3 flex items-start gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] leading-snug"
            style={{
              backgroundColor: isPositiveCapexAlert ? 'var(--accent-blue-soft)' : sv.bg,
              borderColor: 'var(--border-color)',
            }}
            title={protocolSummary}
          >
            {isPositiveCapexAlert ? (
              <TrendingUp
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                style={{ color: 'var(--accent-blue)' }}
              />
            ) : (
              <AlertCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                style={{ color: sv.text }}
              />
            )}
            <div className="min-w-0">
              <span
                className="font-semibold"
                style={{ color: isPositiveCapexAlert ? 'var(--accent-blue)' : sv.text }}
              >
                {isPositiveCapexAlert ? 'Alerta CapEx: ' : 'Acción: '}
              </span>
              <span className="text-[var(--text-secondary)]">
                {kpi.actionBrief ?? protocolSummary}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Minimal Footer */}
      <div
        className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button
          type="button"
          onClick={() => onInspect(kpi)}
          className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium transition hover:underline"
          style={{ color: 'var(--accent-blue)' }}
        >
          <FileText className="h-3 w-3" />
          <span>Ficha técnica</span>
        </button>

        {onDrillSector && (
          <button
            type="button"
            onClick={onDrillSector}
            className="cursor-pointer inline-flex items-center gap-0.5 text-[11px] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            Sector
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </article>
  );
}
