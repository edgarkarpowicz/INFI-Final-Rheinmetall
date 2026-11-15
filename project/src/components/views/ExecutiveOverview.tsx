import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  CORPORATE_CONTEXT,
  PERSONAS,
  SECTORS,
} from '../../data/kpiCatalogEnriched';
import { formatCurrencyMeur, formatIntEs, formatNumberEs } from '../../utils/formatters';
import { ALL_KPI_CODES } from '../../utils/kpiEngine';
import type {
  EvaluatedKpi,
  KpiStatus,
  PeriodSnapshot,
  PersonaId,
  SectorId,
  SectorInfo,
} from '../../types/kpi';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';

interface ExecutiveOverviewProps {
  snapshot: PeriodSnapshot;
  persona: PersonaId;
  onInspectKpi: (kpi: EvaluatedKpi) => void;
  onSelectSector: (sectorId: SectorId) => void;
}

interface SummaryMetricCard {
  label: string;
  value: string;
  sublabel: string;
  accent?: 'blue' | 'green' | 'amber' | 'red';
}

function accentForStatus(status: KpiStatus): 'green' | 'amber' | 'red' {
  if (status === 'Óptimo') return 'green';
  if (status === 'Preventivo') return 'amber';
  return 'red';
}

function buildExecutiveSummaryCards(snapshot: PeriodSnapshot, persona: PersonaId): SummaryMetricCard[] {
  const { rawTotals: raw, oeeBreakdown: oee, kpis, counts } = snapshot;

  if (persona === 'plant-manager') {
    return [
      {
        label: 'OEE Línea Productiva (KPI-2.1)',
        value: kpis['KPI-2.1'].formattedValue,
        sublabel: oee
          ? `Disp. ${formatNumberEs(oee.disponibilidadPct, 1)}% · Rend. ${formatNumberEs(oee.rendimientoPct, 1)}%`
          : `Meta ${kpis['KPI-2.1'].meta.meta}`,
        accent: accentForStatus(kpis['KPI-2.1'].status),
      },
      {
        label: 'Cumplimiento MPS (KPI-2.2)',
        value: kpis['KPI-2.2'].formattedValue,
        sublabel: raw
          ? `${formatIntEs(raw.mpsReal)} / ${formatIntEs(raw.mpsPlan)} u. liberadas`
          : `Meta ${kpis['KPI-2.2'].meta.meta}`,
        accent: accentForStatus(kpis['KPI-2.2'].status),
      },
      {
        label: 'Exposición Plantas & EHS',
        value: raw ? `${formatNumberEs(raw.hhTrab, 2)} M h` : snapshot.plantReference,
        sublabel: `Cierre SLA EHS: ${kpis['KPI-5.1'].formattedValue}`,
      },
      {
        label: 'Accidentabilidad LTIFR (KPI-5.2)',
        value: kpis['KPI-5.2'].formattedValue,
        sublabel: raw
          ? `${formatIntEs(raw.accBaja)} accidentes con baja`
          : `${counts.optimo} Ópt. / ${counts.preventivo} Prev. / ${counts.critico} Crít.`,
        accent: accentForStatus(kpis['KPI-5.2'].status),
      },
    ];
  }

  if (persona === 'qa-qc') {
    const qaStatus: KpiStatus =
      kpis['KPI-3.1'].status === 'Crítico' || kpis['KPI-3.2'].status === 'Crítico'
        ? 'Crítico'
        : kpis['KPI-3.1'].status === 'Preventivo' || kpis['KPI-3.2'].status === 'Preventivo'
          ? 'Preventivo'
          : 'Óptimo';

    return [
      {
        label: 'First-Pass Yield — FPY (KPI-3.1)',
        value: kpis['KPI-3.1'].formattedValue,
        sublabel: oee
          ? `${formatIntEs(oee.piezasConformes)} / ${formatIntEs(oee.piezasTotales)} piezas`
          : 'Norma OTAN AQAP-2110',
        accent: accentForStatus(kpis['KPI-3.1'].status),
      },
      {
        label: 'Rechazo / Demora GQAR (KPI-3.2)',
        value: kpis['KPI-3.2'].formattedValue,
        sublabel: raw
          ? `${formatIntEs(raw.lotesRet)} de ${formatIntEs(raw.lotesPres)} lotes retenidos`
          : `Meta ${kpis['KPI-3.2'].meta.meta.replace('<=', '≤')}`,
        accent: accentForStatus(kpis['KPI-3.2'].status),
      },
      {
        label: 'OEE & Calidad de Línea (KPI-2.1)',
        value: kpis['KPI-2.1'].formattedValue,
        sublabel: oee
          ? `Factor Calidad: ${formatNumberEs(oee.calidadPct, 2)}%`
          : `Meta ${kpis['KPI-2.1'].meta.meta.replace('>=', '≥')}`,
        accent: accentForStatus(kpis['KPI-2.1'].status),
      },
      {
        label: 'Estado Auditoría (AQAP-2110)',
        value: qaStatus,
        sublabel: raw
          ? `${formatIntEs(raw.lotesPres - raw.lotesRet)} / ${formatIntEs(raw.lotesPres)} lotes conformes`
          : `FPY ${kpis['KPI-3.1'].status} · GQAR ${kpis['KPI-3.2'].status}`,
        accent: accentForStatus(qaStatus),
      },
    ];
  }

  if (persona === 'vp-supply') {
    return [
      {
        label: 'Días de Inventario — DOS (KPI-4.1)',
        value: kpis['KPI-4.1'].formattedValue,
        sublabel: 'Banda óptima: 65,0 – 80,0 días',
        accent: accentForStatus(kpis['KPI-4.1'].status),
      },
      {
        label: 'Supplier OTIF Críticos (KPI-4.2)',
        value: kpis['KPI-4.2'].formattedValue,
        sublabel: raw
          ? `${formatIntEs(raw.ocOtif)} / ${formatIntEs(raw.ocTot)} órdenes a tiempo`
          : `Meta ${kpis['KPI-4.2'].meta.meta.replace('>=', '≥')}`,
        accent: accentForStatus(kpis['KPI-4.2'].status),
      },
      {
        label: 'Inventario vs. Consumo Material',
        value: raw ? formatCurrencyMeur(raw.invProm, 1) : snapshot.plantReference,
        sublabel: raw
          ? `Consumo materiales: ${formatCurrencyMeur(raw.matCons, 1)}`
          : `Desglose capital trabajo: vista mensual`,
      },
      {
        label: 'Presión Demanda — BtB (KPI-1.1)',
        value: kpis['KPI-1.1'].formattedValue,
        sublabel: `Pedidos ${formatCurrencyMeur(snapshot.pedidosMeur, 0)} vs. Ventas ${formatCurrencyMeur(snapshot.ventasMeur, 0)}`,
        accent: 'blue',
      },
    ];
  }

  if (persona === 'ehs-manager') {
    return [
      {
        label: 'Cierre Proactivo EHS (KPI-5.1)',
        value: kpis['KPI-5.1'].formattedValue,
        sublabel: raw
          ? `${formatIntEs(raw.ehsCer)} / ${formatIntEs(raw.ehsRep)} hallazgos cerrados`
          : `Meta ${kpis['KPI-5.1'].meta.meta}`,
        accent: accentForStatus(kpis['KPI-5.1'].status),
      },
      {
        label: 'Índice Frecuencia LTIFR (KPI-5.2)',
        value: kpis['KPI-5.2'].formattedValue,
        sublabel: 'Límite ISO 45001: ≤ 2,20 acc./10⁶ h',
        accent: accentForStatus(kpis['KPI-5.2'].status),
      },
      {
        label: 'Horas-Hombre Expuestas',
        value: raw ? `${formatNumberEs(raw.hhTrab, 2)} M h` : snapshot.plantReference,
        sublabel: raw
          ? `${formatIntEs(raw.accBaja)} accidentes con baja médica`
          : snapshot.division,
      },
      {
        label: 'Semáforo Seguridad & Planta',
        value: `${counts.optimo} Ópt. · ${counts.preventivo} Prev. · ${counts.critico} Crít.`,
        sublabel: `Perímetro ATEX · ${snapshot.periodLabel}`,
      },
    ];
  }

  return [
    {
      label: 'Ventas Facturadas',
      value: formatCurrencyMeur(snapshot.ventasMeur, 1),
      sublabel: `${snapshot.periodLabel} · ${snapshot.division}`,
    },
    {
      label: 'Nuevos Pedidos (Nomination)',
      value: formatCurrencyMeur(snapshot.pedidosMeur, 1),
      sublabel: `Book-to-Bill: ${kpis['KPI-1.1'].formattedValue}`,
      accent: 'blue',
    },
    {
      label: 'Resultado Operativo (EBIT)',
      value: formatCurrencyMeur(snapshot.ebitMeur, 2),
      sublabel: `Margen Op.: ${kpis['KPI-1.2'].formattedValue}`,
    },
    {
      label: 'Backlog & Semáforo Global',
      value: CORPORATE_CONTEXT.backlogQ3_2026,
      sublabel: `${counts.optimo} Ópt. · ${counts.preventivo} Prev. · ${counts.critico} Crít. (vs. ${CORPORATE_CONTEXT.backlogPre2022} pre-22)`,
    },
  ];
}

function getValueColor(accent?: SummaryMetricCard['accent']): string {
  if (accent === 'blue') return 'var(--accent-blue)';
  if (accent === 'green') return 'var(--status-green-text)';
  if (accent === 'amber') return 'var(--status-yellow-text)';
  if (accent === 'red') return 'var(--status-red-text)';
  return 'var(--text-primary)';
}

export function ExecutiveOverview({
  snapshot,
  persona,
  onInspectKpi,
  onSelectSector,
}: ExecutiveOverviewProps) {
  const [expandedSecondaryFor, setExpandedSecondaryFor] = useState<PersonaId | null>(null);
  const [protocolScope, setProtocolScope] = useState<'persona' | 'all'>('persona');
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const activePersona = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];
  const isFocusedMode = persona !== 'coo';
  const summaryCards = buildExecutiveSummaryCards(snapshot, persona);

  const primarySectors = SECTORS.filter((s) => activePersona.focusSectors.includes(s.id));
  const secondarySectors = SECTORS.filter((s) => !activePersona.focusSectors.includes(s.id));
  const showSecondary = expandedSecondaryFor === persona;

  const allAlerts = ALL_KPI_CODES.map((code) => snapshot.kpis[code])
    .filter((k) => k.protocolTriggered)
    .sort((a, b) => {
      const rank = { Crítico: 0, Preventivo: 1, Óptimo: 2 };
      return rank[a.status] - rank[b.status];
    });

  const personaAlerts = isFocusedMode
    ? allAlerts.filter((k) => activePersona.primaryKpis.includes(k.meta.codigo))
    : allAlerts;

  const scopedAlerts =
    isFocusedMode && protocolScope === 'persona' ? personaAlerts : allAlerts;
  const visibleAlerts = showAllAlerts ? scopedAlerts : scopedAlerts.slice(0, 3);

  const renderSectorSection = (sector: SectorInfo, isFocus: boolean) => {
    const leadingKpi = snapshot.kpis[sector.leadingCode];
    const laggingKpi = snapshot.kpis[sector.laggingCode];

    return (
      <div key={sector.id} className="space-y-2.5">
        {/* Flat Clean Section Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b pb-1.5"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className="rounded px-1.5 py-0.5 font-mono-num text-[10px] font-semibold"
              style={{
                backgroundColor: 'var(--accent-blue-soft)',
                color: 'var(--accent-blue)',
              }}
            >
              {sector.objetivoId}
            </span>
            <h3 className="font-display text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              {sector.numero}. {sector.nombre}
            </h3>
            {isFocus && (
              <span className="text-[11px] font-medium text-[var(--accent-blue)]">
                · Foco
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectSector(sector.id)}
            className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium transition hover:underline"
            style={{ color: 'var(--accent-blue)' }}
          >
            Explorar
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Direct Leading vs Lagging Cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          <KpiCard
            kpi={leadingKpi}
            onInspect={onInspectKpi}
            highlighted={isFocus}
          />
          <KpiCard
            kpi={laggingKpi}
            onInspect={onInspectKpi}
            highlighted={isFocus}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Slim Stakeholder Strip — shows strictly the active role context */}
      <section className="flex flex-wrap items-center gap-1.5 px-0.5 text-xs">
        <span className="font-semibold text-[var(--text-primary)]">{activePersona.rol}</span>
        <span className="text-[var(--text-muted)]">· {activePersona.nivel}</span>
        {isFocusedMode && (
          <span className="text-[var(--text-muted)]">
            · {activePersona.primaryKpis.length} KPIs clave
          </span>
        )}
      </section>

      {/* Role-Specific 4-Card Summary Strip */}
      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rhm-card rounded-xl p-3.5 sm:p-4">
            <div className="text-[11px] font-medium text-[var(--text-muted)]">{card.label}</div>
            <div
              className="font-mono-num mt-1 text-lg font-bold tracking-tight sm:text-xl"
              style={{ color: getValueColor(card.accent) }}
            >
              {card.value}
            </div>
            <div className="mt-1 text-[10px] text-[var(--text-secondary)]">{card.sublabel}</div>
          </div>
        ))}
      </section>

      {/* Priority Sectors — Minimalist Hierarchy */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            {isFocusedMode
              ? `Sectores Prioritarios — ${activePersona.shortLabel}`
              : 'Cadena de Valor — 5 Objetivos y 10 KPIs SMART'}
          </h2>
          {isFocusedMode && (
            <span className="text-[11px] text-[var(--text-muted)]">
              {primarySectors.length} de {SECTORS.length} sectores en foco
            </span>
          )}
        </div>

        <div className="space-y-6">
          {primarySectors.map((sector) => renderSectorSection(sector, isFocusedMode))}
        </div>

        {secondarySectors.length > 0 && (
          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={() => setExpandedSecondaryFor(showSecondary ? null : persona)}
              className="cursor-pointer flex w-full items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-2.5 text-left text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              <span>
                {showSecondary
                  ? `Ocultar ${secondarySectors.length} sectores adicionales`
                  : `Ver ${secondarySectors.length} sectores adicionales (${secondarySectors
                      .map((s) => s.nombre)
                      .join(', ')})`}
              </span>
              {showSecondary ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>

            {showSecondary && (
              <div className="space-y-6">
                {secondarySectors.map((sector) => renderSectorSection(sector, false))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Compact Decision Protocols List (RF-04) */}
      <section className="rhm-card overflow-hidden rounded-xl">
        <div
          className="flex flex-wrap items-center justify-between gap-2.5 border-b px-4 py-3 sm:px-5"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h3 className="font-display text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            Protocolos Activos y Decisiones Sugeridas (RF-04)
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {isFocusedMode && (
              <div className="flex items-center rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setProtocolScope('persona')}
                  className="cursor-pointer rounded px-2 py-0.5 font-medium transition"
                  style={
                    protocolScope === 'persona'
                      ? {
                          backgroundColor: 'var(--accent-blue-soft)',
                          color: 'var(--accent-blue)',
                          fontWeight: 600,
                        }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  Mi perfil ({personaAlerts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProtocolScope('all')}
                  className="cursor-pointer rounded px-2 py-0.5 font-medium transition"
                  style={
                    protocolScope === 'all'
                      ? {
                          backgroundColor: 'var(--accent-blue-soft)',
                          color: 'var(--accent-blue)',
                          fontWeight: 600,
                        }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  Todos ({allAlerts.length})
                </button>
              </div>
            )}

            <span className="font-mono-num text-[11px] text-[var(--text-muted)]">
              {scopedAlerts.length} acciones
            </span>
          </div>
        </div>

        {scopedAlerts.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-xs text-[var(--status-green-text)] sm:px-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                {isFocusedMode && protocolScope === 'persona' && allAlerts.length > 0
                  ? `Sin desvíos en ${activePersona.shortLabel} (${allAlerts.length} en otros sectores).`
                  : 'Todos los KPIs evaluados se encuentran dentro de meta.'}
              </span>
            </div>
            {isFocusedMode && protocolScope === 'persona' && allAlerts.length > 0 && (
              <button
                type="button"
                onClick={() => setProtocolScope('all')}
                className="cursor-pointer rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
              >
                Ver las {allAlerts.length} totales
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {visibleAlerts.map((kpi) => (
                <div
                  key={kpi.meta.codigo}
                  className="flex flex-col justify-between gap-2 px-4 py-3 transition hover:bg-[var(--bg-elevated)] sm:flex-row sm:items-center sm:px-5"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="font-mono-num text-[11px] font-semibold"
                        style={{ color: 'var(--accent-blue)' }}
                      >
                        {kpi.meta.codigo}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {kpi.meta.nombre}
                      </span>
                      <StatusBadge status={kpi.status} />
                      <span className="font-mono-num text-[11px] text-[var(--text-muted)]">
                        {kpi.formattedValue} vs. {kpi.meta.meta.replace('>=', '≥').replace('<=', '≤')}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                      {kpi.advisoryNote ?? kpi.meta.protocolo}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onInspectKpi(kpi)}
                    className="cursor-pointer shrink-0 self-start text-[11px] font-medium hover:underline sm:self-center"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    Ver ficha →
                  </button>
                </div>
              ))}
            </div>

            {scopedAlerts.length > 3 && (
              <div
                className="border-t px-4 py-2.5 text-center sm:px-5"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}
              >
                <button
                  type="button"
                  onClick={() => setShowAllAlerts((prev) => !prev)}
                  className="cursor-pointer text-[11px] font-medium hover:underline"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  {showAllAlerts
                    ? 'Mostrar 3 principales'
                    : `Ver todos (${scopedAlerts.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
