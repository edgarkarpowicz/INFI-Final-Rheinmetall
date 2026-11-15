import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DATASET } from '../../data/kpiCatalogEnriched';
import { formatNumberEs } from '../../utils/formatters';

export function DosBandChart() {
  const data = DATASET.serie_mensual_2026.map((m) => ({
    mes: m.corto,
    dos: m.kpi_4_1_dos,
    otif: m.kpi_4_2_otif,
    inv: m.inv_prom,
    cons: m.mat_cons,
  }));

  return (
    <div className="rhm-card rounded-xl p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
            KPI-4.1 · Banda Óptima Bidireccional de Días de Inventario (DOS) vs. Tiempo
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Zona sombreada verde = banda óptima <strong>65 – 80 días</strong>. Q1–Q2 refleja acumulación estratégica (~€2.000M en nitrocelulosa y aceros balísticos); Q3–Q4 normaliza capital de trabajo.
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

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="mes" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
            <YAxis
              domain={[45, 100]}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              unit=" d"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                borderColor: 'var(--tooltip-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '12px',
              }}
              formatter={(value, name) => {
                if (name === 'dos') return [`${formatNumberEs(Number(value), 1)} días`, 'KPI-4.1 DOS'];
                return [String(value), String(name)];
              }}
            />
            {/* Calm optimal band 65–80 days */}
            <ReferenceArea y1={65} y2={80} fill="#2f855a" fillOpacity={0.09} />
            <ReferenceArea y1={80} y2={95} fill="#b7791f" fillOpacity={0.05} />
            <ReferenceArea y1={50} y2={65} fill="#b7791f" fillOpacity={0.05} />
            <ReferenceLine y={80} stroke="#2f855a" strokeDasharray="4 4" label={{ value: 'Máx 80 d', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={65} stroke="#2f855a" strokeDasharray="4 4" label={{ value: 'Mín 65 d', fill: 'var(--status-green-text)', fontSize: 10, position: 'insideBottomRight' }} />
            <ReferenceLine y={95} stroke="#b84a4a" strokeDasharray="2 3" />
            <Line
              type="monotone"
              dataKey="dos"
              stroke="#2b6cb0"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#2b6cb0', strokeWidth: 1.5, stroke: 'var(--bg-surface)' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
