import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DATASET } from '../../data/kpiCatalogEnriched';
import { formatKpiValue, formatNumberEs } from '../../utils/formatters';
import type { DivisionalRecord, KpiCode, SectorId } from '../../types/kpi';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--tooltip-bg)',
  borderColor: 'var(--tooltip-border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '12px',
};

interface SectorSeriesChartProps {
  sectorId: SectorId;
  leadingCode: KpiCode;
  laggingCode: KpiCode;
}

export function SectorEvolutionChart({ sectorId, leadingCode, laggingCode }: SectorSeriesChartProps) {
  const months = DATASET.serie_mensual_2026;

  if (sectorId === 'ventas') {
    const data = months.map((m) => ({
      mes: m.corto,
      btb: m.kpi_1_1_btb,
      margen: m.kpi_1_2_margen,
    }));
    return (
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Evolución Mensual 2026: Book-to-Bill (Leading) vs. Margen Operativo (Lagging)
        </h4>
        <p className="mb-3 text-xs text-[var(--text-secondary)]">
          Contraste entre captación comercial (línea azul, meta ≥ 1,50x) y rentabilidad materializada (línea verde, meta ≥ 18,0%).
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[1.0, 2.7]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="x" />
              <YAxis yAxisId="right" orientation="right" domain={[12, 26]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(val, name, item) =>
                  item?.dataKey === 'btb' || String(name).includes('Book-to-Bill')
                    ? [formatKpiValue(leadingCode, Number(val)), 'KPI-1.1 Book-to-Bill']
                    : [formatKpiValue(laggingCode, Number(val)), 'KPI-1.2 Margen Op.']
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine yAxisId="left" y={1.5} stroke="#2b6cb0" strokeDasharray="4 4" label={{ value: 'Meta BtB 1,50x', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine yAxisId="right" y={18.0} stroke="#2f855a" strokeDasharray="4 4" label={{ value: 'Meta Margen 18,0%', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideBottomRight' }} />
              <Line yAxisId="left" type="monotone" dataKey="btb" name="KPI-1.1 Book-to-Bill (x)" stroke="#2b6cb0" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="margen" name="KPI-1.2 Margen Op. (%)" stroke="#2f855a" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (sectorId === 'produccion') {
    const data = months.map((m) => ({
      mes: m.corto,
      oee: m.kpi_2_1_oee,
      mps: m.kpi_2_2_mps,
    }));
    return (
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Evolución Mensual 2026: OEE (Leading) vs. Cumplimiento MPS (Lagging)
        </h4>
        <p className="mb-3 text-xs text-[var(--text-secondary)]">
          Curva de aprendizaje industrial en ramp-up de líneas 155 mm: superación de meta OEE (≥ 82,0%) desde agosto y MPS (≥ 95,0%) desde julio.
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis domain={[70, 100]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(val, name, item) =>
                  item?.dataKey === 'oee' || String(name).includes('OEE')
                    ? [formatKpiValue(leadingCode, Number(val)), 'KPI-2.1 OEE']
                    : [formatKpiValue(laggingCode, Number(val)), 'KPI-2.2 Cumpl. MPS']
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine y={82} stroke="#2b6cb0" strokeDasharray="4 4" label={{ value: 'Meta OEE 82%', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideBottomLeft' }} />
              <ReferenceLine y={95} stroke="#2f855a" strokeDasharray="4 4" label={{ value: 'Meta MPS 95%', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="oee" name="KPI-2.1 OEE (%)" stroke="#2b6cb0" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="mps" name="KPI-2.2 Cumplimiento MPS (%)" stroke="#2f855a" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (sectorId === 'calidad') {
    const data = months.map((m) => ({
      mes: m.corto,
      fpy: m.kpi_3_1_fpy,
      rechazo: m.kpi_3_2_rechazo,
    }));
    return (
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Evolución Mensual 2026: First-Pass Yield (Leading) vs. Rechazo/Retención GQAR (Lagging)
        </h4>
        <p className="mb-3 text-xs text-[var(--text-secondary)]">
          Mientras FPY escala progresivamente (≥ 97,0% desde junio), las retenciones en polígonos GQAR repuntan en Q2–Q3 (pico Jul 2,86%) antes de caer a 0,91% en diciembre.
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[94, 99]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 3.5]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(val, name, item) =>
                  item?.dataKey === 'fpy' || String(name).includes('FPY')
                    ? [formatKpiValue(leadingCode, Number(val)), 'KPI-3.1 FPY']
                    : [formatKpiValue(laggingCode, Number(val)), 'KPI-3.2 Rechazo/Demora']
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine yAxisId="left" y={97} stroke="#2b6cb0" strokeDasharray="4 4" label={{ value: 'Meta FPY 97%', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine yAxisId="right" y={1.5} stroke="#c08434" strokeDasharray="4 4" label={{ value: 'Límite GQAR ≤ 1,5%', fill: 'var(--status-yellow-text)', fontSize: 10, position: 'insideTopRight' }} />
              <Line yAxisId="left" type="monotone" dataKey="fpy" name="KPI-3.1 FPY (%)" stroke="#2b6cb0" strokeWidth={2.5} dot={{ r: 3 }} />
              <Bar yAxisId="right" dataKey="rechazo" name="KPI-3.2 Rechazo/Demora (%)" fill="#c08434" radius={[4, 4, 0, 0]} opacity={0.8} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (sectorId === 'compras') {
    const data = months.map((m) => ({
      mes: m.corto,
      otif: m.kpi_4_2_otif,
      inv: m.inv_prom,
      cons: m.mat_cons,
    }));
    return (
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          KPI-4.2 Supplier OTIF (%) & Dinámica Inventario vs. Consumo [M€]
        </h4>
        <p className="mb-3 text-xs text-[var(--text-secondary)]">
          Confiabilidad de proveedores Tier-1 (meta ≥ 94,0% alcanzada desde julio) junto al flujo mensual de inventario operativo y consumo SAP MM.
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[86, 98]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 2300]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="M" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(val, name, item) =>
                  item?.dataKey === 'otif' || String(name).includes('OTIF')
                    ? [formatKpiValue(laggingCode, Number(val)), 'KPI-4.2 Supplier OTIF']
                    : [`€${formatNumberEs(Number(val), 1)}M`, 'Consumo Materiales']
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine yAxisId="left" y={94} stroke="#2f855a" strokeDasharray="4 4" label={{ value: 'Meta OTIF 94%', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideTopRight' }} />
              <Bar yAxisId="right" dataKey="cons" name="Consumo Materiales [M€]" fill="#64748b" fillOpacity={0.55} radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="otif" name="KPI-4.2 Supplier OTIF (%)" stroke="#2f855a" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Sector 5: Seguridad EHS
  const data = months.map((m) => ({
    mes: m.corto,
    ehs: m.kpi_5_1_ehs,
    ltifr: m.kpi_5_2_ltifr,
  }));
  return (
    <div className="rhm-card rounded-xl p-5">
      <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
        Evolución Mensual 2026: Cierre Proactivo Riesgos (Leading) vs. LTIFR (Lagging)
      </h4>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">
        Relación inversa directa: al consolidar el cierre preventivo en SLA ≥ 95,0% (desde abril), el índice de accidentabilidad LTIFR desciende por debajo del límite 2,20.
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
            <YAxis yAxisId="left" domain={[90, 100]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} unit="%" />
            <YAxis yAxisId="right" orientation="right" domain={[1.4, 2.8]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(val, name, item) =>
                item?.dataKey === 'ehs' || String(name).includes('Cierre')
                  ? [formatKpiValue(leadingCode, Number(val)), 'KPI-5.1 Cierre Proactivo']
                  : [formatKpiValue(laggingCode, Number(val)), 'KPI-5.2 LTIFR']
              }
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <ReferenceLine yAxisId="left" y={95} stroke="#2b6cb0" strokeDasharray="4 4" label={{ value: 'Meta Cierre 95%', fill: 'var(--accent-blue)', fontSize: 10, position: 'insideTopLeft' }} />
            <ReferenceLine yAxisId="right" y={2.2} stroke="#b84a4a" strokeDasharray="4 4" label={{ value: 'Límite LTIFR ≤ 2,20', fill: 'var(--status-red-text)', fontSize: 10, position: 'insideBottomRight' }} />
            <Line yAxisId="left" type="monotone" dataKey="ehs" name="KPI-5.1 Cierre Proactivo (%)" stroke="#2b6cb0" strokeWidth={2.5} dot={{ r: 3 }} />
            <Bar yAxisId="right" dataKey="ltifr" name="KPI-5.2 LTIFR (Acc./10⁶ h)" fill="#c08434" radius={[4, 4, 0, 0]} opacity={0.8} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SectorVolumeDriverChart({ sectorId }: { sectorId: SectorId }) {
  const months = DATASET.serie_mensual_2026;

  if (sectorId === 'ventas') {
    const data = months.map((m) => ({
      mes: m.corto,
      ventas: m.ventas,
      pedidos: m.pedidos,
      ebit: m.ebit,
    }));
    return (
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Flujo Comercial Mensual: Pedidos Captados vs. Ventas Facturadas y EBIT [M€]
        </h4>
        <div className="mt-3 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v, name) => [`€${formatNumberEs(Number(v), 1)}M`, String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="pedidos" name="Nuevos Pedidos [M€]" fill="#5a8bbd" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ventas" name="Ventas Facturadas [M€]" fill="#1d5b8c" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="ebit" name="EBIT Operativo [M€]" stroke="#2f855a" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (sectorId === 'produccion') {
    const data = months.map((m) => ({
      mes: m.corto,
      plan: m.mps_plan,
      real: m.mps_real,
    }));
    return (
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Programa Maestro (MPS): Unidades Planificadas vs. Unidades Liberadas
        </h4>
        <div className="mt-3 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v, name) => [formatNumberEs(Number(v), 0), String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="plan" name="MPS Planificado [u]" fill="#64748b" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
              <Bar dataKey="real" name="Unidades Liberadas [u]" fill="#2b6cb0" fillOpacity={0.9} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (sectorId === 'calidad') {
    const data = months.map((m) => ({
      mes: m.corto,
      presentados: m.lotes_pres,
      retenidos: m.lotes_ret,
    }));
    return (
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Inspección Balística GQAR: Lotes Presentados vs. Lotes Retenidos
        </h4>
        <div className="mt-3 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 7]} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v, name) => [formatNumberEs(Number(v), 0), String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="presentados" name="Lotes Presentados GQAR" fill="#2b6cb0" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="retenidos" name="Lotes Retenidos/Observados" stroke="#b84a4a" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
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
      <div className="rhm-card rounded-xl p-5">
        <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Órdenes de Compra Críticas (SAP MM / Ariba): Conformes OTIF vs. Con Desvío
        </h4>
        <div className="mt-3 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v, name) => [formatNumberEs(Number(v), 0), String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="otif" stackId="a" name="Órdenes OTIF" fill="#2f855a" fillOpacity={0.85} />
              <Bar dataKey="retrasos" stackId="a" name="Órdenes Fuera de Plazo/Cant." fill="#c08434" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
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
    <div className="rhm-card rounded-xl p-5">
      <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
        Exposición Laboral (Horas-Hombre [M h]) vs. Accidentes con Baja y Hallazgos EHS
      </h4>
      <div className="mt-3 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
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
            <Bar yAxisId="left" dataKey="hh" name="Horas-Hombre [M h]" fill="#1d5b8c" fillOpacity={0.82} radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="acc" name="Accidentes con Baja" stroke="#b84a4a" strokeWidth={2.5} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const SECTOR_DIVISION_FIELD_MAP: Record<
  SectorId,
  {
    leadingKey: keyof DivisionalRecord;
    laggingKey: keyof DivisionalRecord;
    leadingLabel: string;
    laggingLabel: string;
  }
> = {
  ventas: {
    leadingKey: 'btb',
    laggingKey: 'margen_pct',
    leadingLabel: 'Book-to-Bill (x)',
    laggingLabel: 'Margen Op. (%)',
  },
  produccion: {
    leadingKey: 'oee_pct',
    laggingKey: 'mps_pct',
    leadingLabel: 'OEE (%)',
    laggingLabel: 'Cumpl. MPS (%)',
  },
  calidad: {
    leadingKey: 'fpy_pct',
    laggingKey: 'rechazo_lotes_pct',
    leadingLabel: 'First-Pass Yield (%)',
    laggingLabel: 'Rechazo Lotes (%)',
  },
  compras: {
    leadingKey: 'dos_dias',
    laggingKey: 'otif_pct',
    leadingLabel: 'DOS (Días)',
    laggingLabel: 'Supplier OTIF (%)',
  },
  seguridad: {
    leadingKey: 'cierre_ehs_pct',
    laggingKey: 'ltifr',
    leadingLabel: 'Cierre Proactivo (%)',
    laggingLabel: 'LTIFR',
  },
};

export function SectorDivisionalComparisonChart({ sectorId }: { sectorId: SectorId }) {
  const cfg = SECTOR_DIVISION_FIELD_MAP[sectorId];
  const quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];

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
          Desglose Comparativo por División y Planta (RF-03 · Q1–Q4 2026)
        </h4>
        <p className="text-xs text-[var(--text-secondary)]">
          Comparación trimestral entre <strong>Weapon & Ammunition</strong> (Unterlüß/Murcia), <strong>Vehicle Systems</strong> (Kassel/Telford) y <strong>Electronic Solutions</strong> (Bremen/Zúrich).
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
            Leading · {cfg.leadingLabel}
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="trimestre" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v, name) => [formatNumberEs(Number(v), 2), String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="wa" name="Weapon & Ammo" fill="#1d5b8c" fillOpacity={0.88} radius={[3, 3, 0, 0]} />
                <Bar dataKey="vs" name="Vehicle Systems" fill="#5a8bbd" fillOpacity={0.88} radius={[3, 3, 0, 0]} />
                <Bar dataKey="es" name="Electronic Sol." fill="#2f855a" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Lagging · {cfg.laggingLabel}
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={laggingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="trimestre" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v, name) => [formatNumberEs(Number(v), 2), String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="wa" name="Weapon & Ammo" fill="#1d5b8c" fillOpacity={0.88} radius={[3, 3, 0, 0]} />
                <Bar dataKey="vs" name="Vehicle Systems" fill="#5a8bbd" fillOpacity={0.88} radius={[3, 3, 0, 0]} />
                <Bar dataKey="es" name="Electronic Sol." fill="#2f855a" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
