import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';

export interface GlossaryEntry {
  full: string;
  detail?: string;
}

export const ACRONYM_GLOSSARY: Record<string, GlossaryEntry> = {
  CapEx: {
    full: 'Inversión de Capital (Capital Expenditure)',
    detail: 'Desembolsos en nuevas plantas, líneas automatizadas y maquinaria fabril.',
  },
  OPEX: {
    full: 'Gastos Operativos (Operating Expenditure)',
    detail: 'Costos recurrentes de operación, administración y estructura diaria.',
  },
  SMED: {
    full: 'Cambio Rápido de Formato (Single-Minute Exchange of Die)',
    detail: 'Metodología Lean para reducir tiempos de setup entre lotes a pocos minutos.',
  },
  CNC: {
    full: 'Control Numérico Computarizado',
    detail: 'Mecanizado automatizado de precisión en celdas y tornos industriales.',
  },
  SPC: {
    full: 'Control Estadístico de Procesos (Statistical Process Control)',
    detail: 'Monitoreo estadístico en línea para detectar desvíos antes de producir defectos.',
  },
  GQAR: {
    full: 'Representante Gubernamental de Aseguramiento de Calidad',
    detail: 'Inspector estatal OTAN que certifica y libera lotes de defensa (AQAP-2110).',
  },
  MRP: {
    full: 'Planificación de Requerimientos de Materiales',
    detail: 'Sistema que programa compras y entregas de insumos según el plan de producción.',
  },
  WIP: {
    full: 'Trabajo en Proceso (Work in Progress)',
    detail: 'Material e inventario semielaborado detenido en líneas antes de ser facturable.',
  },
  SQE: {
    full: 'Ingeniería de Calidad de Proveedores (Supplier Quality Engineering)',
    detail: 'Auditoría técnica y desarrollo correctivo sobre proveedores críticos.',
  },
  'Dual Sourcing': {
    full: 'Doble Abastecimiento Estratégico',
    detail: 'Homologar y repartir volumen entre dos o más proveedores para eliminar cuellos de botella.',
  },
  'Safety Stand-Down': {
    full: 'Pausa Obligatoria de Seguridad',
    detail: 'Detención temporal de planta para investigar incidentes y reforzar protocolos críticos.',
  },
  LOTO: {
    full: 'Bloqueo y Etiquetado de Energías (Lockout / Tagout)',
    detail: 'Procedimiento de aislamiento seguro de energía eléctrica, neumática o mecánica en mantenimiento.',
  },
  ATEX: {
    full: 'Atmósferas Explosivas (ATmosphères EXplosibles)',
    detail: 'Normativa europea de seguridad para zonas con pólvora, nitrocelulosa y material energético.',
  },
  SLA: {
    full: 'Acuerdo de Nivel de Servicio (Service Level Agreement)',
    detail: 'Plazo máximo comprometido para cerrar un hallazgo o riesgo preventivo.',
  },
  OTAN: {
    full: 'Organización del Tratado del Atlántico Norte (NATO)',
    detail: 'Alianza de defensa cuyos estándares de calidad y contratos rigen el sector.',
  },
  OEE: {
    full: 'Eficiencia Global de Equipos (Overall Equipment Effectiveness)',
    detail: 'Producto de Disponibilidad × Rendimiento × Calidad de las líneas.',
  },
  MPS: {
    full: 'Programa Maestro de Producción (Master Production Schedule)',
    detail: 'Plan comprometido de unidades a fabricar y liberar en cada período.',
  },
  FPY: {
    full: 'Rendimiento a la Primera Pasada (First-Pass Yield)',
    detail: 'Porcentaje de piezas aprobadas en primera inspección sin retrabajo.',
  },
  DOS: {
    full: 'Días de Inventario de Suministros (Days of Supply)',
    detail: 'Días de consumo productivo cubiertos por el stock operativo disponible.',
  },
  OTIF: {
    full: 'Entregas a Tiempo y Completas (On-Time In-Full)',
    detail: 'Porcentaje de órdenes recibidas dentro de fecha pactada y sin faltantes.',
  },
  EHS: {
    full: 'Seguridad, Salud Ocupacional y Medio Ambiente (Environment, Health & Safety)',
    detail: 'Gestión integral de prevención de riesgos y cultura Cero Daño.',
  },
  LTIFR: {
    full: 'Índice de Frecuencia de Accidentes con Baja (Lost Time Injury Frequency Rate)',
    detail: 'Accidentes con baja médica por cada millón de horas-hombre trabajadas.',
  },
  EBIT: {
    full: 'Resultado Operativo (Earnings Before Interest & Taxes)',
    detail: 'Ganancia operativa antes de intereses e impuestos.',
  },
  'AQAP-2110': {
    full: 'Allied Quality Assurance Publications 2110',
    detail: 'Norma OTAN de aseguramiento de calidad para diseño y producción de defensa.',
  },
  'ISO 45001': {
    full: 'Norma Internacional ISO 45001',
    detail: 'Estándar global de sistemas de gestión de seguridad y salud en el trabajo.',
  },
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Match longer multi-word keys before single words, enforcing letter/digit boundaries.
const SORTED_TERMS = Object.keys(ACRONYM_GLOSSARY).sort((a, b) => b.length - a.length);
const TERM_REGEX = new RegExp(
  `(?<![\\p{L}\\p{N}])(${SORTED_TERMS.map(escapeRegExp).join('|')})(?![\\p{L}\\p{N}])`,
  'gu'
);

interface ActiveTooltip {
  term: string;
  entry: GlossaryEntry;
  top: number;
  left: number;
  placeBelow: boolean;
}

function AcronymChip({ term }: { term: string }) {
  const entry = ACRONYM_GLOSSARY[term];
  const [tip, setTip] = useState<ActiveTooltip | null>(null);

  if (!entry) return <>{term}</>;

  const titleText = entry.detail ? `${entry.full} — ${entry.detail}` : entry.full;

  const openTip = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const width = 276;
    const placeBelow = rect.top < 110;
    const left =
      typeof window !== 'undefined'
        ? Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 12))
        : 12;
    const top = placeBelow ? rect.bottom + 8 : rect.top - 8;
    setTip({ term, entry, top, left, placeBelow });
  };

  const closeTip = () => setTip(null);

  return (
    <>
      <abbr
        className="rhm-abbr"
        title={titleText}
        aria-label={`${term}: ${titleText}`}
        tabIndex={0}
        onMouseEnter={(e) => openTip(e.currentTarget)}
        onMouseLeave={closeTip}
        onFocus={(e) => openTip(e.currentTarget)}
        onBlur={closeTip}
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeTip();
        }}
      >
        {term}
      </abbr>
      {tip &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] w-[276px] rounded-lg border px-3 py-2 text-left shadow-xl"
            style={{
              top: tip.top,
              left: tip.left,
              transform: tip.placeBelow ? 'none' : 'translateY(-100%)',
              backgroundColor: 'var(--tooltip-bg)',
              borderColor: 'var(--tooltip-border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-baseline gap-1.5 text-[11px] font-bold leading-snug" style={{ color: 'var(--accent-blue)' }}>
              <span className="shrink-0">{tip.term}</span>
              <span className="shrink-0 text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-primary)]">{tip.entry.full}</span>
            </div>
            {tip.entry.detail && (
              <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
                {tip.entry.detail}
              </p>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

/** Wraps known industrial/financial acronyms in hoverable glossary badges. */
export function AcronymText({ text }: { text: string }) {
  if (!text) return null;

  const nodes: Array<{ key: string; term: string | null; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TERM_REGEX.lastIndex = 0;

  while ((match = TERM_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({
        key: `txt-${lastIndex}`,
        term: null,
        value: text.slice(lastIndex, match.index),
      });
    }
    const matchedTerm = match[1];
    nodes.push({
      key: `abbr-${match.index}-${matchedTerm}`,
      term: matchedTerm,
      value: matchedTerm,
    });
    lastIndex = match.index + matchedTerm.length;
  }

  if (lastIndex < text.length) {
    nodes.push({
      key: `txt-${lastIndex}`,
      term: null,
      value: text.slice(lastIndex),
    });
  }

  return (
    <>
      {nodes.map((n) =>
        n.term ? (
          <AcronymChip key={n.key} term={n.term} />
        ) : (
          <Fragment key={n.key}>{n.value}</Fragment>
        )
      )}
    </>
  );
}
