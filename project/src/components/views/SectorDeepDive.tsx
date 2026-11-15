import { Cpu, UserCheck } from 'lucide-react';
import { PERSONAS, SECTORS, SECTOR_BY_ID } from '../../data/kpiCatalogEnriched';
import type { EvaluatedKpi, PeriodSnapshot, PersonaId, SectorId } from '../../types/kpi';
import { KpiCard } from '../common/KpiCard';
import { DosBandChart } from '../charts/DosBandChart';
import { OeeDecomposition } from '../charts/OeeDecomposition';
import {
  SectorDivisionalComparisonChart,
  SectorEvolutionChart,
  SectorVolumeDriverChart,
} from '../charts/SectorCharts';

interface SectorDeepDiveProps {
  snapshot: PeriodSnapshot;
  activeSector: SectorId;
  persona?: PersonaId;
  onSelectSector: (s: SectorId) => void;
  onInspectKpi: (kpi: EvaluatedKpi) => void;
}

export function SectorDeepDive({
  snapshot,
  activeSector,
  persona = 'coo',
  onSelectSector,
  onInspectKpi,
}: SectorDeepDiveProps) {
  const sector = SECTOR_BY_ID[activeSector];
  const leadingKpi = snapshot.kpis[sector.leadingCode];
  const laggingKpi = snapshot.kpis[sector.laggingCode];
  const activePersona = PERSONAS.find((p) => p.id === persona);

  return (
    <div className="space-y-5">
      {/* Sector Selector Pills (RF-02) */}
      <div className="flex flex-wrap gap-2">
        {SECTORS.map((s) => {
          const isActive = s.id === activeSector;
          const isInPersonaFocus =
            persona !== 'coo' && Boolean(activePersona?.focusSectors.includes(s.id));
          const sLead = snapshot.kpis[s.leadingCode].status;
          const sLag = snapshot.kpis[s.laggingCode].status;
          const hasCritical = sLead === 'Crítico' || sLag === 'Crítico';
          const hasPreventivo = sLead === 'Preventivo' || sLag === 'Preventivo';

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSector(s.id)}
              className={`cursor-pointer inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition sm:text-sm ${isActive ? 'font-semibold shadow-xs' : 'font-medium hover:border-[var(--border-strong)]'
                }`}
              style={
                isActive
                  ? {
                    backgroundColor: 'var(--accent-blue-soft)',
                    borderColor: 'var(--accent-blue)',
                    color: 'var(--accent-blue)',
                  }
                  : {
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }
              }
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: hasCritical
                    ? 'var(--status-red)'
                    : hasPreventivo
                      ? 'var(--status-yellow)'
                      : 'var(--status-green)',
                }}
              />
              <span>
                {s.numero}. {s.nombre}
              </span>
              {isInPersonaFocus && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--accent-blue)',
                  }}
                >
                  Foco
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calm Sector Strategic Objective Banner */}
      <section
        className="rhm-card rounded-xl border-l-4 p-5"
        style={{ borderLeftColor: 'var(--accent-blue)' }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded px-2 py-0.5 font-mono-num text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent-blue-soft)',
                  color: 'var(--accent-blue)',
                }}
              >
                {sector.objetivoId}
              </span>
              <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                Sector {sector.numero}: {sector.nombre} ({sector.subtituloEn})
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
              {sector.objetivoTexto}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <Cpu className="h-3.5 w-3.5" style={{ color: 'var(--accent-blue)' }} />
              <strong className="text-[var(--text-primary)]">ETL:</strong> {sector.sistemasEtl}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <UserCheck className="h-3.5 w-3.5" style={{ color: 'var(--accent-blue)' }} />
              <strong className="text-[var(--text-primary)]">Decisor:</strong> {sector.decisorPrincipal}
            </span>
          </div>
        </div>
      </section>

      {/* Leading vs Lagging Contrast Cards (RF-02) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiCard kpi={leadingKpi} onInspect={onInspectKpi} highlighted />
        <KpiCard kpi={laggingKpi} onInspect={onInspectKpi} highlighted />
      </div>

      {/* Special Analytical Modules per Sector + Temporal Charts (RF-03) */}
      {activeSector === 'produccion' && snapshot.oeeBreakdown && (
        <OeeDecomposition
          breakdown={snapshot.oeeBreakdown}
          oeeValue={leadingKpi.value}
          periodLabel={snapshot.periodLabel}
        />
      )}

      {activeSector === 'compras' && <DosBandChart />}

      <div className="grid gap-5 xl:grid-cols-2">
        <SectorEvolutionChart
          sectorId={activeSector}
          leadingCode={sector.leadingCode}
          laggingCode={sector.laggingCode}
        />
        <SectorVolumeDriverChart sectorId={activeSector} />
      </div>

      {/* Divisional Breakdown for the active sector (RF-03) */}
      <SectorDivisionalComparisonChart sectorId={activeSector} />
    </div>
  );
}
