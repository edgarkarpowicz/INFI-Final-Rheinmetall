import { CalendarRange } from 'lucide-react';
import { DATASET, PERSONAS } from '../../data/kpiCatalogEnriched';
import type {
  DivisionFilter,
  DivisionalRecord,
  EvaluatedKpi,
  KpiCode,
  MonthlyRecord,
  PeriodFilter,
  PeriodSnapshot,
  PersonaId,
} from '../../types/kpi';
import { KPI_CHART_META } from '../../utils/chartConfig';
import { formatKpiValue } from '../../utils/formatters';
import { ALL_KPI_CODES, evaluateStatus, getPeriodSnapshot } from '../../utils/kpiEngine';
import { getStatusVars } from '../common/StatusBadge';

interface ExecutiveHeatmapProps {
  snapshot: PeriodSnapshot;
  persona: PersonaId;
  onSelectPeriod?: (period: PeriodFilter) => void;
  onInspectKpi: (
    kpi: EvaluatedKpi,
    context?: { period: PeriodFilter; division: DivisionFilter }
  ) => void;
}

const MONTHLY_FIELD_BY_CODE: Record<KpiCode, keyof MonthlyRecord> = {
  'KPI-1.1': 'kpi_1_1_btb',
  'KPI-1.2': 'kpi_1_2_margen',
  'KPI-2.1': 'kpi_2_1_oee',
  'KPI-2.2': 'kpi_2_2_mps',
  'KPI-3.1': 'kpi_3_1_fpy',
  'KPI-3.2': 'kpi_3_2_rechazo',
  'KPI-4.1': 'kpi_4_1_dos',
  'KPI-4.2': 'kpi_4_2_otif',
  'KPI-5.1': 'kpi_5_1_ehs',
  'KPI-5.2': 'kpi_5_2_ltifr',
};

const DIVISIONAL_FIELD_BY_CODE: Record<KpiCode, keyof DivisionalRecord> = {
  'KPI-1.1': 'btb',
  'KPI-1.2': 'margen_pct',
  'KPI-2.1': 'oee_pct',
  'KPI-2.2': 'mps_pct',
  'KPI-3.1': 'fpy_pct',
  'KPI-3.2': 'rechazo_lotes_pct',
  'KPI-4.1': 'dos_dias',
  'KPI-4.2': 'otif_pct',
  'KPI-5.1': 'cierre_ehs_pct',
  'KPI-5.2': 'ltifr',
};

function isColumnActive(colPeriod: PeriodFilter, activePeriod: PeriodFilter, trimestre: string): boolean {
  if (activePeriod === colPeriod) return true;
  if (activePeriod === 'FY-2026') return true;
  if (activePeriod === '9M-2026') return trimestre !== 'Q4 2026';
  return activePeriod === trimestre;
}

export function ExecutiveHeatmap({
  snapshot,
  persona,
  onSelectPeriod,
  onInspectKpi,
}: ExecutiveHeatmapProps) {
  const activePersona = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];
  const isConsolidated = snapshot.division === 'Grupo Consolidado';

  const columns: Array<{
    period: PeriodFilter;
    label: string;
    trimestre: string;
    isForecast: boolean;
    getVal: (code: KpiCode) => number;
  }> = isConsolidated
    ? DATASET.serie_mensual_2026.map((m) => ({
        period: m.id as PeriodFilter,
        label: m.corto,
        trimestre: m.trimestre,
        isForecast: m.trimestre === 'Q4 2026',
        getVal: (code) => Number(m[MONTHLY_FIELD_BY_CODE[code]]),
      }))
    : DATASET.desglose_divisional_2026
        .filter((d) => d.division === snapshot.division)
        .map((d) => ({
          period: d.trimestre as PeriodFilter,
          label: d.trimestre.replace(' 2026', ''),
          trimestre: d.trimestre,
          isForecast: d.trimestre === 'Q4 2026',
          getVal: (code) => Number(d[DIVISIONAL_FIELD_BY_CODE[code]]),
        }));

  const handleCellClick = (code: KpiCode, cellPeriod: PeriodFilter) => {
    onSelectPeriod?.(cellPeriod);
    const snap = getPeriodSnapshot(cellPeriod, snapshot.division);
    onInspectKpi(snap.kpis[code], { period: cellPeriod, division: snapshot.division });
  };

  return (
    <section className="rhm-card overflow-hidden rounded-xl">
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-[var(--accent-blue)]" />
          <div>
            <h3 className="font-display text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              Mapa Semafórico 2026 — {snapshot.division}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              {isConsolidated
                ? '10 KPIs × 12 meses (Oct–Dic proyección) · Clic en una celda para ir al mes y abrir la ficha.'
                : '10 KPIs × 4 trimestres (Q4 proyección) · Clic en una celda para abrir la ficha.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-[10px]">
          <span className="inline-flex items-center gap-1 text-[var(--status-green-text)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--status-green)' }} />
            Óptimo
          </span>
          <span className="inline-flex items-center gap-1 text-[var(--status-yellow-text)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--status-yellow)' }} />
            Preventivo
          </span>
          <span className="inline-flex items-center gap-1 text-[var(--status-red-text)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--status-red)' }} />
            Crítico
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-left text-[11px] ${isConsolidated ? 'min-w-[920px]' : 'min-w-[540px]'}`}>
          <thead>
            <tr
              className="border-b text-[10px] uppercase tracking-wider text-[var(--text-muted)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <th className="w-44 px-3 py-2 font-semibold sm:px-4">Indicador KPI</th>
              {columns.map((col) => {
                const active = isColumnActive(col.period, snapshot.period, col.trimestre);
                return (
                  <th key={col.period} className="px-1 py-2 text-center font-semibold">
                    <button
                      type="button"
                      onClick={() => onSelectPeriod?.(col.period)}
                      className={`inline-flex flex-col items-center rounded px-1.5 py-0.5 transition ${
                        onSelectPeriod ? 'cursor-pointer hover:bg-[var(--bg-subtle)]' : ''
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: 'var(--accent-blue-soft)',
                              color: 'var(--accent-blue)',
                            }
                          : undefined
                      }
                      title={`Filtrar tablero a ${col.label}`}
                    >
                      <span>{col.label}</span>
                      {col.isForecast && (
                        <span className="text-[8px] font-medium lowercase opacity-75">proy</span>
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {ALL_KPI_CODES.map((code) => {
              const chartMeta = KPI_CHART_META[code];
              const isFocus = persona !== 'coo' && activePersona.primaryKpis.includes(code);
              return (
                <tr key={code} className="transition hover:bg-[var(--bg-elevated)]/60">
                  <td
                    className="px-3 py-1.5 sm:px-4"
                    style={
                      isFocus
                        ? { borderLeft: '3px solid var(--accent-blue)' }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-mono-num text-[10px] font-semibold"
                        style={{ color: 'var(--accent-blue)' }}
                      >
                        {code.replace('KPI-', '')}
                      </span>
                      <span className="truncate font-medium text-[var(--text-primary)]">
                        {chartMeta.shortLabel}
                      </span>
                    </div>
                  </td>
                  {columns.map((col) => {
                    const val = col.getVal(code);
                    const status = evaluateStatus(code, val);
                    const sv = getStatusVars(status);
                    const active = isColumnActive(col.period, snapshot.period, col.trimestre);
                    return (
                      <td key={`${code}-${col.period}`} className="px-1 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleCellClick(code, col.period)}
                          title={`${code} (${chartMeta.shortLabel}) · ${col.label}: ${formatKpiValue(code, val)} · ${status}`}
                          className={`font-mono-num w-full cursor-pointer rounded border px-1 py-1 text-[10px] font-semibold transition hover:brightness-95 ${
                            active ? 'ring-1 ring-[var(--accent-blue)]/45' : 'opacity-90'
                          }`}
                          style={{
                            backgroundColor: sv.bg,
                            color: sv.text,
                            borderColor: sv.border,
                          }}
                        >
                          {formatKpiValue(code, val)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
