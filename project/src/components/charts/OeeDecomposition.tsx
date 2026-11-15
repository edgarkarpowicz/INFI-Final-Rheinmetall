import { Clock, Cpu, Gauge, Wrench } from 'lucide-react';
import { formatIntEs, formatNumberEs } from '../../utils/formatters';
import type { PeriodSnapshot } from '../../types/kpi';

interface OeeDecompositionProps {
  breakdown: NonNullable<PeriodSnapshot['oeeBreakdown']>;
  oeeValue: number;
  periodLabel: string;
}

export function OeeDecomposition({ breakdown, oeeValue, periodLabel }: OeeDecompositionProps) {
  const pillars = [
    {
      name: 'Disponibilidad',
      value: breakdown.disponibilidadPct,
      detail: `${formatIntEs(breakdown.horasReales)} h operativas / ${formatIntEs(breakdown.horasPlanificadas)} h planificadas`,
      protocol: 'Mantenimiento preventivo autónomo, reducción de microparadas y cambios rápidos SMED.',
      color: '#2b6cb0',
    },
    {
      name: 'Rendimiento',
      value: breakdown.rendimientoPct,
      detail: `Ciclo ideal ${formatNumberEs(breakdown.cicloIdealMin, 2)} min/u · ${formatIntEs(breakdown.piezasTotales)} piezas producidas`,
      protocol: 'Recalibrar parámetros CNC/robóticos y estabilizar velocidad nominal de celdas.',
      color: '#5a8bbd',
    },
    {
      name: 'Calidad (OEE)',
      value: breakdown.calidadPct,
      detail: `${formatIntEs(breakdown.piezasConformes)} piezas conformes / ${formatIntEs(breakdown.piezasTotales)} totales`,
      protocol: 'Detener estación para ajuste de herramental y control SPC en línea.',
      color: '#2f855a',
    },
  ];

  const bottleneck = [...pillars].sort((a, b) => a.value - b.value)[0];

  return (
    <div className="rhm-card rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-[#007EC1]" />
          <div>
            <h4 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
              Descomposición Factorial OEE — {periodLabel}
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              OEE = Disponibilidad × Rendimiento × Calidad (Siemens Opcenter MES / SCADA)
            </p>
          </div>
        </div>
        <div className="rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-1.5 text-right">
          <div className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">OEE Consolidado</div>
          <div className="font-mono-num text-lg font-bold text-[var(--text-primary)]">
            {formatNumberEs(oeeValue, 2)}%
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {pillars.map((p) => {
          const isBottleneck = p.name === bottleneck.name;
          return (
            <div
              key={p.name}
              className={`rounded-lg border p-4 ${isBottleneck ? 'ring-1 ring-amber-500/50' : ''}`}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: isBottleneck ? 'var(--status-yellow-border)' : 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {p.name}
                </span>
                {isBottleneck && (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: 'var(--status-yellow-bg)',
                      color: 'var(--status-yellow-text)',
                    }}
                  >
                    Mayor pérdida
                  </span>
                )}
              </div>

              <div className="font-mono-num mt-1.5 text-2xl font-bold text-[var(--text-primary)]">
                {formatNumberEs(p.value, 2)}%
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, p.value)}%`, backgroundColor: p.color }}
                />
              </div>

              <p className="mt-2.5 text-[11px] text-[var(--text-secondary)]">{p.detail}</p>
              <div className="mt-2 flex items-start gap-1.5 text-[11px] text-[var(--text-muted)]">
                <Wrench className="mt-0.5 h-3 w-3 shrink-0 text-[#007EC1]" />
                <span>{p.protocol}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-xs">
        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Clock className="h-3.5 w-3.5 text-[#007EC1]" />
          Pérdida horaria en período:{' '}
          <strong className="font-mono-num text-[var(--text-primary)]">
            {formatIntEs(breakdown.horasPlanificadas - breakdown.horasReales)} h
          </strong>{' '}
          (paradas, setup y averías)
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Cpu className="h-3.5 w-3.5 text-[#007EC1]" />
          Piezas retrabajo/scrap:{' '}
          <strong className="font-mono-num text-[var(--text-primary)]">
            {formatIntEs(breakdown.piezasTotales - breakdown.piezasConformes)} u
          </strong>
        </span>
      </div>
    </div>
  );
}
