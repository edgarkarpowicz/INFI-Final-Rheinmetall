import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DATASET } from '../../data/kpiCatalogEnriched';
import type { PeriodFilter } from '../../types/kpi';
import {
  getActiveMonthHighlight,
  getMonthIdFromCorto,
  KPI_CHART_META,
} from '../../utils/chartConfig';
import { formatNumberEs } from '../../utils/formatters';
import { evaluateStatus } from '../../utils/kpiEngine';
import {
  buildKpiThresholdElements,
  buildMonthlyGuideElements,
  makeSemaphoreDot,
  TOOLTIP_STYLE,
} from './chartGuides';

interface DosBandChartProps {
  period?: PeriodFilter;
  onSelectPeriod?: (p: PeriodFilter) => void;
}

export function DosBandChart({ period, onSelectPeriod }: DosBandChartProps) {
  const data = DATASET.serie_mensual_2026.map((m) => ({
    mes: m.corto,
    dos: m.kpi_4_1_dos,
    otif: m.kpi_4_2_otif,
    inv: m.inv_prom,
    cons: m.mat_cons,
  }));

  const highlight = getActiveMonthHighlight(period);
  const domain = KPI_CHART_META['KPI-4.1'].monthlyDomain;

  return (
    <div className="rhm-card rounded-xl p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
            KPI-4.1 · Banda Óptima Bidireccional de Días de Inventario (DOS) vs. Tiempo
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Zona sombreada verde = banda óptima <strong>65 – 80 días</strong>. Q1–Q2 refleja acumulación estratégica (~€2.000M en nitrocelulosa y aceros balísticos); Q3–Q4 normaliza capital de trabajo.
            {onSelectPeriod && (
              <span className="ml-1.5 text-[var(--accent-blue)]">· Clic en un mes para filtrar</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded border border-[var(--status-green-border)] bg-[var(--status-green-bg)] px-2 py-0.5 text-[var(--status-green-text)]">
            Óptimo: 65–80 d
          </span>
          <span className="rounded border border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] px-2 py-0.5 text-[var(--status-yellow-text)]">
            Preventivo: 50–64 / 81–95 d
          </span>
        </div>
      </div>

      <div className={`h-72 w-full ${onSelectPeriod ? 'cursor-pointer' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            onClick={(state) => {
              if (!onSelectPeriod || state?.activeLabel == null) return;
              const next = getMonthIdFromCorto(String(state.activeLabel));
              if (next) onSelectPeriod(next);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
            <YAxis
              domain={domain}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              unit=" d"
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => {
                if (name === 'dos' || String(name).includes('DOS')) {
                  const num = Number(value);
                  const st = evaluateStatus('KPI-4.1', num);
                  return [`${formatNumberEs(num, 1)} días · ${st}`, 'KPI-4.1 DOS'];
                }
                return [String(value), String(name)];
              }}
            />
            {buildKpiThresholdElements('KPI-4.1', domain)}
            {buildMonthlyGuideElements({ period, includeForecast: true })}
            <Line
              type="monotone"
              dataKey="dos"
              name="KPI-4.1 DOS (días)"
              stroke="var(--accent-blue)"
              strokeWidth={2.5}
              dot={makeSemaphoreDot('KPI-4.1', highlight, 'dos')}
              activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--bg-surface)' }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
