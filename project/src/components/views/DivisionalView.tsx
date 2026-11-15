import { useState } from 'react';
import { Factory, MapPin } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DATASET } from '../../data/kpiCatalogEnriched';
import { formatCurrencyMeur, formatNumberEs } from '../../utils/formatters';
import { evaluateStatus, getPeriodSnapshot, normalizePeriodForDivision } from '../../utils/kpiEngine';
import type { DivisionFilter, DivisionalRecord, KpiCode, PeriodFilter } from '../../types/kpi';
import { getStatusVars } from '../common/StatusBadge';

interface DivisionalViewProps {
  period: PeriodFilter;
  onSelectDivision?: (division: DivisionFilter) => void;
}

const DEFENSE_DIVISIONS: Array<Exclude<DivisionFilter, 'Grupo Consolidado'>> = [
  'Weapon & Ammunition',
  'Vehicle Systems',
  'Electronic Solutions',
];

const METRICS: Array<{
  key: keyof DivisionalRecord;
  label: string;
  kpiCode?: KpiCode;
  unit: string;
}> = [
    { key: 'ventas_meur', label: 'Ventas Facturadas [M€]', unit: 'M€' },
    { key: 'pedidos_meur', label: 'Nuevos Pedidos [M€]', unit: 'M€' },
    { key: 'btb', label: 'KPI-1.1 Book-to-Bill (x)', kpiCode: 'KPI-1.1', unit: 'x' },
    { key: 'margen_pct', label: 'KPI-1.2 Margen Operativo (%)', kpiCode: 'KPI-1.2', unit: '%' },
    { key: 'oee_pct', label: 'KPI-2.1 OEE (%)', kpiCode: 'KPI-2.1', unit: '%' },
    { key: 'mps_pct', label: 'KPI-2.2 Cumplimiento MPS (%)', kpiCode: 'KPI-2.2', unit: '%' },
    { key: 'fpy_pct', label: 'KPI-3.1 First-Pass Yield (%)', kpiCode: 'KPI-3.1', unit: '%' },
    { key: 'rechazo_lotes_pct', label: 'KPI-3.2 Rechazo Lotes GQAR (%)', kpiCode: 'KPI-3.2', unit: '%' },
    { key: 'dos_dias', label: 'KPI-4.1 Días de Inventario DOS (d)', kpiCode: 'KPI-4.1', unit: ' d' },
    { key: 'otif_pct', label: 'KPI-4.2 Supplier OTIF (%)', kpiCode: 'KPI-4.2', unit: '%' },
    { key: 'cierre_ehs_pct', label: 'KPI-5.1 Cierre Proactivo EHS (%)', kpiCode: 'KPI-5.1', unit: '%' },
    { key: 'ltifr', label: 'KPI-5.2 LTIFR (Acc./10⁶ h)', kpiCode: 'KPI-5.2', unit: '' },
  ];

export function DivisionalView({ period, onSelectDivision }: DivisionalViewProps) {
  const [selectedMetricKey, setSelectedMetricKey] = useState<keyof DivisionalRecord>('margen_pct');
  const activeMetric = METRICS.find((m) => m.key === selectedMetricKey) ?? METRICS[3];

  const effectivePeriod = period.startsWith('2026-')
    ? normalizePeriodForDivision(period, 'Weapon & Ammunition')
    : period;
  const groupSnap = getPeriodSnapshot(effectivePeriod, 'Grupo Consolidado');
  const divSnapshots = DEFENSE_DIVISIONS.map((div) => getPeriodSnapshot(effectivePeriod, div));

  const quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
  const chartData = quarters.map((q) => {
    const rows = DATASET.desglose_divisional_2026.filter((d) => d.trimestre === q);
    return {
      trimestre: q.replace(' 2026', ''),
      wa: Number(rows.find((r) => r.division === 'Weapon & Ammunition')?.[selectedMetricKey] ?? 0),
      vs: Number(rows.find((r) => r.division === 'Vehicle Systems')?.[selectedMetricKey] ?? 0),
      es: Number(rows.find((r) => r.division === 'Electronic Solutions')?.[selectedMetricKey] ?? 0),
    };
  });

  const renderCellBadge = (code: KpiCode, value: number, suffix: string, decimals = 2) => {
    const status = evaluateStatus(code, value);
    const sv = getStatusVars(status);
    return (
      <span
        className="font-mono-num inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold"
        style={{ backgroundColor: sv.bg, color: sv.text }}
      >
        {formatNumberEs(value, decimals)}
        {suffix}
      </span>
    );
  };

  const periodChip = (divSnapshots[0]?.periodLabel ?? period)
    .replace(' (Ene–Sep Acumulado)', '')
    .replace(' (Anual Consolidado)', '');

  return (
    <div className="space-y-6">
      {/* Super Card: División Defensa (Grupo Consolidado) grouping all 3 sub-divisions */}
      <section className="rhm-card rounded-xl p-4 sm:p-5">
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Factory className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <h2 className="font-display text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              División Defensa
            </h2>
            <span className="text-[11px] text-[var(--text-muted)]">
              · Grupo Consolidado ({DEFENSE_DIVISIONS.length} sub-divisiones)
            </span>
            <span className="rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2 py-0.5 font-mono-num text-[10px] font-semibold text-[var(--text-secondary)]">
              {periodChip}
            </span>
          </div>

          {onSelectDivision && (
            <button
              type="button"
              onClick={() => onSelectDivision('Grupo Consolidado')}
              className="cursor-pointer rounded-md border px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-90"
              style={{
                backgroundColor: 'var(--accent-blue-soft)',
                borderColor: 'var(--border-color)',
                color: 'var(--accent-blue)',
              }}
            >
              Filtrar tablero: Grupo Consolidado →
            </button>
          )}
        </div>

        {/* Consolidated Group Baseline Metrics */}
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-b py-3 sm:grid-cols-3 lg:grid-cols-6"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Ventas Grupo</div>
            <div className="font-mono-num text-sm font-bold text-[var(--text-primary)]">
              {formatCurrencyMeur(groupSnap.ventasMeur, 1)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Pedidos Grupo</div>
            <div
              className="font-mono-num text-sm font-bold"
              style={{ color: 'var(--accent-blue)' }}
            >
              {formatCurrencyMeur(groupSnap.pedidosMeur, 1)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Margen Op.</div>
            <div className="font-mono-num text-sm font-bold text-[var(--text-primary)]">
              {groupSnap.kpis['KPI-1.2'].formattedValue}
              <span className="ml-1 text-[10px] font-normal text-[var(--text-muted)]">
                ({formatCurrencyMeur(groupSnap.ebitMeur, 0)})
              </span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Book-to-Bill</div>
            <div className="font-mono-num text-sm font-bold text-[var(--text-primary)]">
              {groupSnap.kpis['KPI-1.1'].formattedValue}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-[var(--text-muted)]">OEE · FPY</div>
            <div className="font-mono-num mt-0.5 text-xs font-semibold text-[var(--text-primary)]">
              {groupSnap.kpis['KPI-2.1'].formattedValue} · {groupSnap.kpis['KPI-3.1'].formattedValue}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Estado KPIs (10)</div>
            <div
              className="font-mono-num mt-0.5 text-xs font-semibold"
              title={`Semáforo de los 10 KPIs: ${groupSnap.counts.optimo} Óptimo, ${groupSnap.counts.preventivo} Preventivo, ${groupSnap.counts.critico} Crítico`}
            >
              <span style={{ color: 'var(--status-green-text)' }}>{groupSnap.counts.optimo} Ópt.</span>
              <span className="text-[var(--text-muted)]"> · </span>
              <span style={{ color: 'var(--status-yellow-text)' }}>{groupSnap.counts.preventivo} Prev.</span>
              <span className="text-[var(--text-muted)]"> · </span>
              <span style={{ color: 'var(--status-red-text)' }}>{groupSnap.counts.critico} Crít.</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3.5 lg:grid-cols-3">
          {divSnapshots.map((snap) => (
            <div
              key={snap.division}
              className="flex flex-col justify-between rounded-lg border p-4"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div>
                <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">
                  {snap.division}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {snap.plantReference}
                </p>

                <div
                  className="mt-3 grid grid-cols-3 gap-2 border-y py-2.5"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div>
                    <div className="text-[10px] uppercase text-[var(--text-muted)]">Ventas</div>
                    <div className="font-mono-num text-sm font-bold text-[var(--text-primary)]">
                      {formatCurrencyMeur(snap.ventasMeur, 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--text-muted)]">Pedidos</div>
                    <div
                      className="font-mono-num text-sm font-bold"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      {formatCurrencyMeur(snap.pedidosMeur, 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--text-muted)]">Margen Op.</div>
                    <div className="font-mono-num text-sm font-bold text-[var(--text-primary)]">
                      {snap.kpis['KPI-1.2'].formattedValue}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>
                    OEE <strong className="font-mono-num">{snap.kpis['KPI-2.1'].formattedValue}</strong>
                  </span>
                  <span>
                    FPY <strong className="font-mono-num">{snap.kpis['KPI-3.1'].formattedValue}</strong>
                  </span>
                </div>
                <div
                  className="flex items-center justify-between border-t pt-1.5"
                  style={{ borderColor: 'var(--border-color)' }}
                  title={`Semáforo de los 10 KPIs: ${snap.counts.optimo} Óptimo, ${snap.counts.preventivo} Preventivo, ${snap.counts.critico} Crítico`}
                >
                  <span className="text-[var(--text-muted)]">Estado KPIs (10)</span>
                  <span className="font-mono-num font-semibold">
                    <span style={{ color: 'var(--status-green-text)' }}>{snap.counts.optimo} Ópt.</span>
                    <span className="text-[var(--text-muted)]"> · </span>
                    <span style={{ color: 'var(--status-yellow-text)' }}>{snap.counts.preventivo} Prev.</span>
                    <span className="text-[var(--text-muted)]"> · </span>
                    <span style={{ color: 'var(--status-red-text)' }}>{snap.counts.critico} Crít.</span>
                  </span>
                </div>
              </div>

              {onSelectDivision && (
                <button
                  type="button"
                  onClick={() => onSelectDivision(snap.division)}
                  className="cursor-pointer mt-3 w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] py-1.5 text-[11px] font-medium transition hover:border-[var(--border-strong)]"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  Filtrar tablero en esta división →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Divisional Comparison Chart */}
      <section className="rhm-card rounded-xl p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-base font-bold tracking-tight text-[var(--text-primary)]">
              Comparativa Trimestral entre Divisiones (Q1–Q4 2026)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Compare cualquier métrica o KPI entre las plantas de Alemania, España, Reino Unido y Suiza.
            </p>
          </div>

          <select
            aria-label="Seleccionar métrica para comparar divisiones"
            value={String(selectedMetricKey)}
            onChange={(e) => setSelectedMetricKey(e.target.value as keyof DivisionalRecord)}
            className="cursor-pointer rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] outline-none hover:border-[#007EC1]"
          >
            {METRICS.map((m) => (
              <option key={String(m.key)} value={String(m.key)}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="trimestre" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  borderColor: 'var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
                formatter={(v) => `${formatNumberEs(Number(v), 2)}${activeMetric.unit}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="wa"
                name="Weapon & Ammunition (Unterlüß / Murcia)"
                fill="#1d5b8c"
                fillOpacity={0.88}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="vs"
                name="Vehicle Systems (Kassel / Telford)"
                fill="#5a8bbd"
                fillOpacity={0.88}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="es"
                name="Electronic Solutions (Bremen / Zúrich)"
                fill="#2f855a"
                fillOpacity={0.85}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Complete 12-Row Divisional Matrix */}
      <section className="rhm-card overflow-hidden rounded-xl">
        <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-display text-base font-bold tracking-tight text-[var(--text-primary)]">
            Matriz Completa por División y Planta (12 Registros Trimestrales)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead
              className="border-b text-[11px] uppercase tracking-wider text-[var(--text-muted)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <tr>
                <th className="px-3 py-2.5">División</th>
                <th className="px-3 py-2.5">Planta</th>
                <th className="px-3 py-2.5">Trim.</th>
                <th className="px-3 py-2.5 text-right">Ventas</th>
                <th className="px-3 py-2.5 text-right">Pedidos</th>
                <th className="px-3 py-2.5 text-center">BtB</th>
                <th className="px-3 py-2.5 text-center">Margen</th>
                <th className="px-3 py-2.5 text-center">OEE</th>
                <th className="px-3 py-2.5 text-center">MPS</th>
                <th className="px-3 py-2.5 text-center">FPY</th>
                <th className="px-3 py-2.5 text-center">GQAR</th>
                <th className="px-3 py-2.5 text-center">DOS</th>
                <th className="px-3 py-2.5 text-center">OTIF</th>
                <th className="px-3 py-2.5 text-center">EHS</th>
                <th className="px-3 py-2.5 text-center">LTIFR</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {DATASET.desglose_divisional_2026.map((row) => (
                <tr
                  key={`${row.division}-${row.trimestre}`}
                  className="hover:bg-[var(--bg-elevated)]"
                >
                  <td className="px-3 py-2 font-semibold text-[var(--text-primary)]">{row.division}</td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{row.planta}</td>
                  <td className="px-3 py-2 font-mono-num text-[var(--text-secondary)]">{row.trimestre}</td>
                  <td className="px-3 py-2 text-right font-mono-num">{formatCurrencyMeur(row.ventas_meur, 0)}</td>
                  <td className="px-3 py-2 text-right font-mono-num">{formatCurrencyMeur(row.pedidos_meur, 0)}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-1.1', row.btb, 'x')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-1.2', row.margen_pct, '%')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-2.1', row.oee_pct, '%')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-2.2', row.mps_pct, '%')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-3.1', row.fpy_pct, '%')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-3.2', row.rechazo_lotes_pct, '%')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-4.1', row.dos_dias, 'd', 1)}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-4.2', row.otif_pct, '%')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-5.1', row.cierre_ehs_pct, '%')}</td>
                  <td className="px-3 py-2 text-center">{renderCellBadge('KPI-5.2', row.ltifr, '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
