import { Clock, Cpu, Gauge, Wrench } from 'lucide-react';
import { formatIntEs, formatNumberEs } from '../../utils/formatters';
import type { PeriodSnapshot } from '../../types/kpi';
import { AcronymText } from '../common/AcronymText';

interface OeeDecompositionProps {
  breakdown: NonNullable<PeriodSnapshot['oeeBreakdown']>;
  oeeValue: number;
  periodLabel: string;
}

function RadialFactorGauge({
  value,
  color,
  isBottleneck,
}: {
  value: number;
  color: string;
  isBottleneck: boolean;
}) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circ * (1 - pct / 100);

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-subtle)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={isBottleneck ? 'var(--status-yellow)' : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ.toFixed(2)}
          strokeDashoffset={offset.toFixed(2)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono-num text-[15px] font-bold leading-none text-[var(--text-primary)]">
          {formatNumberEs(value, 1)}%
        </span>
      </div>
    </div>
  );
}

export function OeeDecomposition({ breakdown, oeeValue, periodLabel }: OeeDecompositionProps) {
  const disp = breakdown.disponibilidadPct;
  const rend = breakdown.rendimientoPct;
  const cal = breakdown.calidadPct;

  const pillars = [
    {
      name: 'Disponibilidad',
      value: disp,
      detail: `${formatIntEs(breakdown.horasReales)} h operativas / ${formatIntEs(breakdown.horasPlanificadas)} h planificadas`,
      protocol: 'Mantenimiento preventivo autónomo, reducción de microparadas y cambios rápidos de formato (SMED).',
      color: 'var(--chart-div-1)',
    },
    {
      name: 'Rendimiento',
      value: rend,
      detail: `Ciclo ideal ${formatNumberEs(breakdown.cicloIdealMin, 2)} min/u · ${formatIntEs(breakdown.piezasTotales)} piezas producidas`,
      protocol: 'Recalibrar parámetros de control numérico (CNC) / robóticos y estabilizar velocidad nominal de celdas.',
      color: 'var(--chart-div-2)',
    },
    {
      name: 'Calidad (OEE)',
      value: cal,
      detail: `${formatIntEs(breakdown.piezasConformes)} piezas conformes / ${formatIntEs(breakdown.piezasTotales)} totales`,
      protocol: 'Detener estación para ajuste de herramental y control estadístico de procesos (SPC) en línea.',
      color: 'var(--status-green)',
    },
  ];

  const bottleneck = [...pillars].sort((a, b) => a.value - b.value)[0];

  // Sequential factorial loss from 100% ideal capacity to actual OEE
  const afterDisp = disp;
  const afterRend = (disp * rend) / 100;
  const computedOee = (afterRend * cal) / 100;
  const lossDisp = Math.max(0, 100 - afterDisp);
  const lossRend = Math.max(0, afterDisp - afterRend);
  const lossCal = Math.max(0, afterRend - computedOee);

  const waterfallSegments = [
    {
      label: 'OEE Efectivo',
      pct: computedOee,
      color: oeeValue >= 82 ? 'var(--status-green)' : 'var(--accent-blue)',
      textColor: oeeValue >= 82 ? 'var(--status-green-text)' : 'var(--accent-blue)',
      tag: `${formatNumberEs(oeeValue, 2)}%`,
    },
    {
      label: 'Pérdida Disponibilidad',
      pct: lossDisp,
      color: 'var(--status-yellow)',
      textColor: 'var(--status-yellow-text)',
      tag: `−${formatNumberEs(lossDisp, 2)} pp`,
    },
    {
      label: 'Pérdida Rendimiento',
      pct: lossRend,
      color: 'var(--chart-div-2)',
      textColor: 'var(--text-secondary)',
      tag: `−${formatNumberEs(lossRend, 2)} pp`,
    },
    {
      label: 'Pérdida Calidad',
      pct: lossCal,
      color: 'var(--status-red)',
      textColor: 'var(--status-red-text)',
      tag: `−${formatNumberEs(lossCal, 2)} pp`,
    },
  ];

  return (
    <div className="rhm-card rounded-xl p-5">
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-[var(--accent-blue)]" />
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

      {/* 3 Radial Dial Gauges */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {pillars.map((p) => {
          const isBottleneck = p.name === bottleneck.name;
          return (
            <div
              key={p.name}
              className="rounded-lg border p-4"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: isBottleneck ? 'var(--status-yellow-border)' : 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
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

              <div className="mt-3 flex items-center gap-3.5">
                <RadialFactorGauge
                  value={p.value}
                  color={p.color}
                  isBottleneck={isBottleneck}
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="font-mono-num text-base font-bold text-[var(--text-primary)]">
                    {formatNumberEs(p.value, 2)}%
                  </div>
                  <p className="text-[11px] leading-snug text-[var(--text-secondary)]">{p.detail}</p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-1.5 border-t pt-2.5 text-[11px] text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
                <Wrench className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent-blue)]" />
                <span><AcronymText text={p.protocol} /></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cascada de Pérdidas 100% -> OEE */}
      <div className="mt-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[var(--text-primary)]">
            Cascada de Pérdidas OEE (100% capacidad teórica → {formatNumberEs(oeeValue, 2)}% útil)
          </span>
          <span className="font-mono-num text-[11px] text-[var(--text-muted)]">
            {formatNumberEs(disp, 1)}% × {formatNumberEs(rend, 1)}% × {formatNumberEs(cal, 1)}%
          </span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
          {waterfallSegments.map((seg) => (
            <div
              key={seg.label}
              title={`${seg.label}: ${seg.tag}`}
              style={{
                width: `${Math.max(0.8, seg.pct)}%`,
                backgroundColor: seg.color,
              }}
            />
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
          {waterfallSegments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate text-[var(--text-secondary)]">{seg.label}:</span>
              <strong className="font-mono-num shrink-0" style={{ color: seg.textColor }}>
                {seg.tag}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-xs">
        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Clock className="h-3.5 w-3.5 text-[var(--accent-blue)]" />
          Pérdida horaria en período:{' '}
          <strong className="font-mono-num text-[var(--text-primary)]">
            {formatIntEs(breakdown.horasPlanificadas - breakdown.horasReales)} h
          </strong>{' '}
          (paradas, setup y averías)
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Cpu className="h-3.5 w-3.5 text-[var(--accent-blue)]" />
          Piezas retrabajo/scrap:{' '}
          <strong className="font-mono-num text-[var(--text-primary)]">
            {formatIntEs(breakdown.piezasTotales - breakdown.piezasConformes)} u
          </strong>
        </span>
      </div>
    </div>
  );
}
