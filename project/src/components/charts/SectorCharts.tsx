import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DATASET } from '../../data/kpiCatalogEnriched';
import type { DivisionalRecord, KpiCode, PeriodFilter, SectorId } from '../../types/kpi';
import {
  getActiveMonthHighlight,
  getActiveQuarterShort,
  getMonthIdFromCorto,
  getQuarterPeriodFromShort,
  KPI_CHART_META,
} from '../../utils/chartConfig';
import { formatKpiValue, formatNumberEs } from '../../utils/formatters';
import { evaluateStatus } from '../../utils/kpiEngine';
import {
  buildKpiThresholdElements,
  buildMonthlyGuideElements,
  makeSemaphoreDot,
  TOOLTIP_STYLE,
} from './chartGuides';

interface SectorSeriesChartProps {
  sectorId: SectorId;
  leadingCode: KpiCode;
  laggingCode: KpiCode;
  period?: PeriodFilter;
  onSelectPeriod?: (p: PeriodFilter) => void;
}

function formatKpiTooltip(code: KpiCode, value: number, label: string): [string, string] {
  const status = evaluateStatus(code, value);
  return [`${formatKpiValue(code, value)} · ${status}`, label];
}

function handleMonthlyChartClick(
  onSelectPeriod: ((p: PeriodFilter) => void) | undefined,
  state: { activeLabel?: string | number } | undefined
) {
  if (!onSelectPeriod || state?.activeLabel == null) return;
  const next = getMonthIdFromCorto(String(state.activeLabel));
  if (next) onSelectPeriod(next);
}

function ChartCardShell({
  title,
  subtitle,
  interactive,
  children,
}: {
  title: string;
  subtitle?: string;
  interactive: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rhm-card rounded-xl p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
            {title}
          </h4>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {subtitle}
              {interactive && (
                <span className="ml-1.5 text-[var(--accent-blue)]">· Clic en un mes para filtrar</span>
              )}
            </p>
          )}
        </div>
        {!subtitle && interactive && (
          <span className="text-[11px] text-[var(--accent-blue)]">Clic en un mes para filtrar</span>
        )}
      </div>
      <div className={`h-72 w-full ${interactive ? 'cursor-pointer' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SectorEvolutionChart({
  sectorId,
  leadingCode,
  laggingCode,
  period,
  onSelectPeriod,
}: SectorSeriesChartProps) {
  const months = DATASET.serie_mensual_2026;
  const highlight = getActiveMonthHighlight(period);
  const interactive = Boolean(onSelectPeriod);

  if (sectorId === 'ventas') {
    const data = months.map((m) => ({
      mes: m.corto,
      btb: m.kpi_1_1_btb,
      margen: m.kpi_1_2_margen,
    }));
    return (
      <ChartCardShell
        title="Evolución Mensual 2026: Book-to-Bill (Leading) vs. Margen Operativo (Lagging)"
        subtitle="Contraste entre captación comercial (meta ≥ 1,50x) y rentabilidad materializada (meta ≥ 18,0%), con puntos por estado semafórico."
        interactive={interactive}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis yAxisId="left" domain={[1.0, 2.7]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="x" />
          <YAxis yAxisId="right" orientation="right" domain={[12, 26]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val, name, item) =>
              item?.dataKey === 'btb' || String(name).includes('Book-to-Bill')
                ? formatKpiTooltip(leadingCode, Number(val), 'KPI-1.1 Book-to-Bill')
                : formatKpiTooltip(laggingCode, Number(val), 'KPI-1.2 Margen Op.')
            }
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceArea yAxisId="left" y1={1.5} y2={2.7} fill="var(--status-green)" fillOpacity={0.045} />
          {buildMonthlyGuideElements({ period, yAxisId: 'left', includeForecast: true })}
          <ReferenceLine
            yAxisId="left"
            y={1.5}
            stroke="var(--accent-blue)"
            strokeDasharray="4 4"
            label={{ value: 'Meta BtB ≥ 1,50x', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideTopLeft' }}
          />
          <ReferenceLine
            yAxisId="right"
            y={18.0}
            stroke="var(--status-green)"
            strokeDasharray="4 4"
            label={{ value: 'Meta Margen ≥ 18,0%', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideBottomRight' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="btb"
            name="KPI-1.1 Book-to-Bill (x)"
            stroke="var(--accent-blue)"
            strokeWidth={2.5}
            dot={makeSemaphoreDot(leadingCode, highlight, 's1-btb')}
            activeDot={{ r: 6, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="margen"
            name="KPI-1.2 Margen Op. (%)"
            stroke="var(--status-green)"
            strokeWidth={2.5}
            dot={makeSemaphoreDot(laggingCode, highlight, 's1-mar')}
            activeDot={{ r: 6, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartCardShell>
    );
  }

  if (sectorId === 'produccion') {
    const data = months.map((m) => ({
      mes: m.corto,
      oee: m.kpi_2_1_oee,
      mps: m.kpi_2_2_mps,
    }));
    return (
      <ChartCardShell
        title="Evolución Mensual 2026: OEE (Leading) vs. Cumplimiento MPS (Lagging)"
        subtitle="Curva de aprendizaje industrial en líneas de 155 mm: superación de meta OEE (≥ 82,0%) desde agosto y MPS (≥ 95,0%) desde julio."
        interactive={interactive}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis domain={[70, 100]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val, name, item) =>
              item?.dataKey === 'oee' || String(name).includes('OEE')
                ? formatKpiTooltip(leadingCode, Number(val), 'KPI-2.1 OEE')
                : formatKpiTooltip(laggingCode, Number(val), 'KPI-2.2 Cumpl. MPS')
            }
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceArea y1={82} y2={100} fill="var(--status-green)" fillOpacity={0.045} />
          {buildMonthlyGuideElements({ period, includeForecast: true })}
          <ReferenceLine
            y={82}
            stroke="var(--accent-blue)"
            strokeDasharray="4 4"
            label={{ value: 'Meta OEE ≥ 82%', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideBottomLeft' }}
          />
          <ReferenceLine
            y={95}
            stroke="var(--status-green)"
            strokeDasharray="4 4"
            label={{ value: 'Meta MPS ≥ 95%', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideTopLeft' }}
          />
          <Line
            type="monotone"
            dataKey="oee"
            name="KPI-2.1 OEE (%)"
            stroke="var(--accent-blue)"
            strokeWidth={2.5}
            dot={makeSemaphoreDot(leadingCode, highlight, 's2-oee')}
            activeDot={{ r: 6, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="mps"
            name="KPI-2.2 Cumplimiento MPS (%)"
            stroke="var(--status-green)"
            strokeWidth={2.5}
            dot={makeSemaphoreDot(laggingCode, highlight, 's2-mps')}
            activeDot={{ r: 6, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartCardShell>
    );
  }

  if (sectorId === 'calidad') {
    const data = months.map((m) => ({
      mes: m.corto,
      fpy: m.kpi_3_1_fpy,
      rechazo: m.kpi_3_2_rechazo,
    }));
    return (
      <ChartCardShell
        title="Evolución Mensual 2026: First-Pass Yield (Leading) vs. Rechazo/Retención GQAR (Lagging)"
        subtitle="FPY escala progresivamente (≥ 97,0% desde junio), mientras las retenciones en polígonos GQAR repuntan en Q2–Q3 (pico Jul 2,86%) antes de caer a 0,91%."
        interactive={interactive}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis yAxisId="left" domain={[94, 99]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 3.5]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val, name, item) =>
              item?.dataKey === 'fpy' || String(name).includes('FPY')
                ? formatKpiTooltip(leadingCode, Number(val), 'KPI-3.1 FPY')
                : formatKpiTooltip(laggingCode, Number(val), 'KPI-3.2 Rechazo/Demora')
            }
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceArea yAxisId="left" y1={97} y2={99} fill="var(--status-green)" fillOpacity={0.045} />
          {buildMonthlyGuideElements({ period, yAxisId: 'left', includeForecast: true })}
          <ReferenceLine
            yAxisId="left"
            y={97}
            stroke="var(--accent-blue)"
            strokeDasharray="4 4"
            label={{ value: 'Meta FPY ≥ 97%', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideTopLeft' }}
          />
          <ReferenceLine
            yAxisId="right"
            y={1.5}
            stroke="var(--status-yellow)"
            strokeDasharray="4 4"
            label={{ value: 'Límite GQAR ≤ 1,5%', fill: 'var(--status-yellow-text)', fontSize: 10, position: 'insideTopRight' }}
          />
          <Bar
            yAxisId="right"
            dataKey="rechazo"
            name="KPI-3.2 Rechazo/Demora (%)"
            fill="var(--status-yellow)"
            radius={[4, 4, 0, 0]}
            opacity={0.72}
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="fpy"
            name="KPI-3.1 FPY (%)"
            stroke="var(--accent-blue)"
            strokeWidth={2.5}
            dot={makeSemaphoreDot(leadingCode, highlight, 's3-fpy')}
            activeDot={{ r: 6, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartCardShell>
    );
  }

  if (sectorId === 'compras') {
    const data = months.map((m) => ({
      mes: m.corto,
      otif: m.kpi_4_2_otif,
      inv: m.inv_prom,
      cons: m.mat_cons,
    }));
    const otifDomain: [number, number] = [86, 98];
    return (
      <ChartCardShell
        title="KPI-4.2 Supplier OTIF (%) & Dinámica Inventario vs. Consumo [M€]"
        subtitle="Confiabilidad de proveedores Tier-1 (meta ≥ 94,0% alcanzada desde julio) junto al flujo mensual de consumo SAP MM."
        interactive={interactive}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis yAxisId="left" domain={otifDomain} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 2300]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="M" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val, name, item) =>
              item?.dataKey === 'otif' || String(name).includes('OTIF')
                ? formatKpiTooltip(laggingCode, Number(val), 'KPI-4.2 Supplier OTIF')
                : [`€${formatNumberEs(Number(val), 1)}M`, 'Consumo Materiales']
            }
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {buildKpiThresholdElements(laggingCode, otifDomain, { yAxisId: 'left' })}
          {buildMonthlyGuideElements({ period, yAxisId: 'left', includeForecast: true })}
          <Bar
            yAxisId="right"
            dataKey="cons"
            name="Consumo Materiales [M€]"
            fill="var(--chart-neutral)"
            fillOpacity={0.45}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="otif"
            name="KPI-4.2 Supplier OTIF (%)"
            stroke="var(--status-green)"
            strokeWidth={2.5}
            dot={makeSemaphoreDot(laggingCode, highlight, 's4-otif')}
            activeDot={{ r: 6, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartCardShell>
    );
  }

  // Sector 5: Seguridad EHS
  const data = months.map((m) => ({
    mes: m.corto,
    ehs: m.kpi_5_1_ehs,
    ltifr: m.kpi_5_2_ltifr,
  }));
  return (
    <ChartCardShell
      title="Evolución Mensual 2026: Cierre Proactivo Riesgos (Leading) vs. LTIFR (Lagging)"
      subtitle="Relación inversa directa: al consolidar el cierre preventivo en SLA ≥ 95,0% (desde abril), el índice de accidentabilidad LTIFR desciende por debajo del límite 2,20."
      interactive={interactive}
    >
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
        onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
        <YAxis yAxisId="left" domain={[90, 100]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
        <YAxis yAxisId="right" orientation="right" domain={[1.4, 2.8]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(val, name, item) =>
            item?.dataKey === 'ehs' || String(name).includes('Cierre')
              ? formatKpiTooltip(leadingCode, Number(val), 'KPI-5.1 Cierre Proactivo')
              : formatKpiTooltip(laggingCode, Number(val), 'KPI-5.2 LTIFR')
          }
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <ReferenceArea yAxisId="left" y1={95} y2={100} fill="var(--status-green)" fillOpacity={0.045} />
        {buildMonthlyGuideElements({ period, yAxisId: 'left', includeForecast: true })}
        <ReferenceLine
          yAxisId="left"
          y={95}
          stroke="var(--accent-blue)"
          strokeDasharray="4 4"
          label={{ value: 'Meta Cierre ≥ 95%', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideTopLeft' }}
        />
        <ReferenceLine
          yAxisId="right"
          y={2.2}
          stroke="var(--status-red)"
          strokeDasharray="4 4"
          label={{ value: 'Límite LTIFR ≤ 2,20', fill: 'var(--status-red-text)', fontSize: 10, position: 'insideBottomRight' }}
        />
        <Bar
          yAxisId="right"
          dataKey="ltifr"
          name="KPI-5.2 LTIFR (Acc./10⁶ h)"
          fill="var(--status-yellow)"
          radius={[4, 4, 0, 0]}
          opacity={0.72}
          isAnimationActive={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="ehs"
          name="KPI-5.1 Cierre Proactivo (%)"
          stroke="var(--accent-blue)"
          strokeWidth={2.5}
          dot={makeSemaphoreDot(leadingCode, highlight, 's5-ehs')}
          activeDot={{ r: 6, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartCardShell>
  );
}

export function SectorVolumeDriverChart({
  sectorId,
  period,
  onSelectPeriod,
}: {
  sectorId: SectorId;
  period?: PeriodFilter;
  onSelectPeriod?: (p: PeriodFilter) => void;
}) {
  const months = DATASET.serie_mensual_2026;
  const interactive = Boolean(onSelectPeriod);

  if (sectorId === 'ventas') {
    const data = months.map((m) => ({
      mes: m.corto,
      ventas: m.ventas,
      pedidos: m.pedidos,
      ebit: m.ebit,
    }));
    return (
      <ChartCardShell
        title="Flujo Comercial Mensual: Pedidos Captados vs. Ventas Facturadas y EBIT [M€]"
        interactive={interactive}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [`€${formatNumberEs(Number(v), 1)}M`, String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {buildMonthlyGuideElements({ period, includeForecast: true })}
          <Bar dataKey="pedidos" name="Nuevos Pedidos [M€]" fill="var(--chart-div-2)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="ventas" name="Ventas Facturadas [M€]" fill="var(--chart-div-1)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Line type="monotone" dataKey="ebit" name="EBIT Operativo [M€]" stroke="var(--status-green)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
        </ComposedChart>
      </ChartCardShell>
    );
  }

  if (sectorId === 'produccion') {
    const data = months.map((m) => ({
      mes: m.corto,
      plan: m.mps_plan,
      real: m.mps_real,
    }));
    return (
      <ChartCardShell
        title="Programa Maestro (MPS): Unidades Planificadas vs. Unidades Liberadas"
        interactive={interactive}
      >
        <BarChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [formatNumberEs(Number(v), 0), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {buildMonthlyGuideElements({ period, includeForecast: true })}
          <Bar dataKey="plan" name="MPS Planificado [u]" fill="var(--chart-neutral)" fillOpacity={0.55} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="real" name="Unidades Liberadas [u]" fill="var(--chart-div-1)" fillOpacity={0.9} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartCardShell>
    );
  }

  if (sectorId === 'calidad') {
    const data = months.map((m) => ({
      mes: m.corto,
      presentados: m.lotes_pres,
      retenidos: m.lotes_ret,
    }));
    return (
      <ChartCardShell
        title="Inspección Balística GQAR: Lotes Presentados vs. Lotes Retenidos"
        interactive={interactive}
      >
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 7]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [formatNumberEs(Number(v), 0), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {buildMonthlyGuideElements({ period, yAxisId: 'left', includeForecast: true })}
          <Bar yAxisId="left" dataKey="presentados" name="Lotes Presentados GQAR" fill="var(--chart-div-1)" fillOpacity={0.85} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Line yAxisId="right" type="monotone" dataKey="retenidos" name="Lotes Retenidos/Observados" stroke="var(--status-red)" strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
        </ComposedChart>
      </ChartCardShell>
    );
  }

  if (sectorId === 'compras') {
    const data = months.map((m) => ({
      mes: m.corto,
      totales: m.oc_tot,
      otif: m.oc_otif,
      retrasos: m.oc_tot - m.oc_otif,
    }));
    return (
      <ChartCardShell
        title="Órdenes de Compra Críticas (SAP MM / Ariba): Conformes OTIF vs. Con Desvío"
        interactive={interactive}
      >
        <BarChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [formatNumberEs(Number(v), 0), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {buildMonthlyGuideElements({ period, includeForecast: true })}
          <Bar dataKey="otif" stackId="a" name="Órdenes OTIF" fill="var(--status-green)" fillOpacity={0.85} isAnimationActive={false} />
          <Bar dataKey="retrasos" stackId="a" name="Órdenes Fuera de Plazo/Cant." fill="var(--status-yellow)" fillOpacity={0.85} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartCardShell>
    );
  }

  // Seguridad
  const data = months.map((m) => ({
    mes: m.corto,
    hh: m.hh_trab,
    acc: m.acc_baja,
    reportados: m.ehs_rep,
    cerrados: m.ehs_cer,
  }));
  return (
    <ChartCardShell
      title="Exposición Laboral (Horas-Hombre [M h]) vs. Accidentes con Baja y Hallazgos EHS"
      interactive={interactive}
    >
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
        onClick={(state) => handleMonthlyChartClick(onSelectPeriod, state)}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
        <YAxis yAxisId="left" domain={[4.2, 5.5]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="M" />
        <YAxis yAxisId="right" orientation="right" domain={[0, 16]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v, name, item) =>
            item?.dataKey === 'hh' || String(name).includes('M h')
              ? [`${formatNumberEs(Number(v), 2)} M h`, String(name)]
              : [formatNumberEs(Number(v), 0), String(name)]
          }
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {buildMonthlyGuideElements({ period, yAxisId: 'left', includeForecast: true })}
        <Bar yAxisId="left" dataKey="hh" name="Horas-Hombre [M h]" fill="var(--chart-div-1)" fillOpacity={0.82} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        <Line yAxisId="right" type="monotone" dataKey="acc" name="Accidentes con Baja" stroke="var(--status-red)" strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
      </ComposedChart>
    </ChartCardShell>
  );
}

const SECTOR_DIVISION_FIELD_MAP: Record<
  SectorId,
  {
    leadingCode: KpiCode;
    laggingCode: KpiCode;
    leadingKey: keyof DivisionalRecord;
    laggingKey: keyof DivisionalRecord;
    leadingLabel: string;
    laggingLabel: string;
  }
> = {
  ventas: {
    leadingCode: 'KPI-1.1',
    laggingCode: 'KPI-1.2',
    leadingKey: 'btb',
    laggingKey: 'margen_pct',
    leadingLabel: 'Book-to-Bill (x)',
    laggingLabel: 'Margen Op. (%)',
  },
  produccion: {
    leadingCode: 'KPI-2.1',
    laggingCode: 'KPI-2.2',
    leadingKey: 'oee_pct',
    laggingKey: 'mps_pct',
    leadingLabel: 'OEE (%)',
    laggingLabel: 'Cumpl. MPS (%)',
  },
  calidad: {
    leadingCode: 'KPI-3.1',
    laggingCode: 'KPI-3.2',
    leadingKey: 'fpy_pct',
    laggingKey: 'rechazo_lotes_pct',
    leadingLabel: 'First-Pass Yield (%)',
    laggingLabel: 'Rechazo Lotes (%)',
  },
  compras: {
    leadingCode: 'KPI-4.1',
    laggingCode: 'KPI-4.2',
    leadingKey: 'dos_dias',
    laggingKey: 'otif_pct',
    leadingLabel: 'DOS (Días)',
    laggingLabel: 'Supplier OTIF (%)',
  },
  seguridad: {
    leadingCode: 'KPI-5.1',
    laggingCode: 'KPI-5.2',
    leadingKey: 'cierre_ehs_pct',
    laggingKey: 'ltifr',
    leadingLabel: 'Cierre Proactivo (%)',
    laggingLabel: 'LTIFR',
  },
};

function DivisionQuarterPanel({
  title,
  accentClass,
  code,
  data,
  activeQuarter,
  onSelectPeriod,
}: {
  title: string;
  accentClass: string;
  code: KpiCode;
  data: Array<{ trimestre: string; wa: number; vs: number; es: number }>;
  activeQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null;
  onSelectPeriod?: (p: PeriodFilter) => void;
}) {
  const domain = KPI_CHART_META[code].divisionalDomain;

  return (
    <div>
      <div className={`mb-2 text-xs font-bold uppercase tracking-wider ${accentClass}`}>
        {title}
      </div>
      <div className={`h-60 w-full ${onSelectPeriod ? 'cursor-pointer' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 10, left: 0, bottom: 5 }}
            onClick={(state) => {
              if (!onSelectPeriod || state?.activeLabel == null) return;
              const next = getQuarterPeriodFromShort(String(state.activeLabel));
              if (next) onSelectPeriod(next);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="trimestre" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} domain={domain} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v, name) => formatKpiTooltip(code, Number(v), String(name))}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {buildKpiThresholdElements(code, domain)}
            {activeQuarter && (
              <ReferenceLine
                x={activeQuarter}
                stroke="var(--accent-blue)"
                strokeWidth={2}
                strokeOpacity={0.55}
              />
            )}
            <Bar dataKey="wa" name="Weapon & Ammo" fill="var(--chart-div-1)" fillOpacity={0.9} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="vs" name="Vehicle Systems" fill="var(--chart-div-2)" fillOpacity={0.9} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="es" name="Electronic Sol." fill="var(--chart-div-3)" fillOpacity={0.88} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SectorDivisionalComparisonChart({
  sectorId,
  period,
  onSelectPeriod,
}: {
  sectorId: SectorId;
  period?: PeriodFilter;
  onSelectPeriod?: (p: PeriodFilter) => void;
}) {
  const cfg = SECTOR_DIVISION_FIELD_MAP[sectorId];
  const quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
  const activeQuarter = getActiveQuarterShort(period);

  const buildQuarterSeries = (field: keyof DivisionalRecord) =>
    quarters.map((q) => {
      const rows = DATASET.desglose_divisional_2026.filter((d) => d.trimestre === q);
      const getVal = (div: string) => Number(rows.find((r) => r.division === div)?.[field] ?? 0);
      return {
        trimestre: q.replace(' 2026', ''),
        wa: getVal('Weapon & Ammunition'),
        vs: getVal('Vehicle Systems'),
        es: getVal('Electronic Solutions'),
      };
    });

  const leadingData = buildQuarterSeries(cfg.leadingKey);
  const laggingData = buildQuarterSeries(cfg.laggingKey);

  return (
    <div className="rhm-card rounded-xl p-5">
      <div className="mb-3">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Desglose Comparativo por División y Planta (Q1–Q4 2026)
        </h4>
        <p className="text-xs text-[var(--text-secondary)]">
          Comparación trimestral entre <strong>Weapon & Ammunition</strong> (Unterlüß/Murcia), <strong>Vehicle Systems</strong> (Kassel/Telford) y <strong>Electronic Solutions</strong> (Bremen/Zúrich).
          {onSelectPeriod && (
            <span className="ml-1.5 text-[var(--accent-blue)]">· Clic en un trimestre para filtrar</span>
          )}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DivisionQuarterPanel
          title={`Leading · ${cfg.leadingLabel}`}
          accentClass="text-[var(--accent-blue)]"
          code={cfg.leadingCode}
          data={leadingData}
          activeQuarter={activeQuarter}
          onSelectPeriod={onSelectPeriod}
        />
        <DivisionQuarterPanel
          title={`Lagging · ${cfg.laggingLabel}`}
          accentClass="text-[var(--text-secondary)]"
          code={cfg.laggingCode}
          data={laggingData}
          activeQuarter={activeQuarter}
          onSelectPeriod={onSelectPeriod}
        />
      </div>
    </div>
  );
}
