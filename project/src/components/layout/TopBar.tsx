import { Calendar, Database, Menu } from 'lucide-react';
import { DATASET, PERSONAS } from '../../data/kpiCatalogEnriched';
import { RheinmetallLogo } from '../common/RheinmetallLogo';
import type { DivisionFilter, MainViewId, PeriodFilter, PersonaId } from '../../types/kpi';

interface TopBarProps {
  activeView: MainViewId;
  persona: PersonaId;
  division: DivisionFilter;
  onDivisionChange: (d: DivisionFilter) => void;
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  dataOriginLabel: string;
  isDivisionalQuarterlyOnly: boolean;
  onOpenMobileMenu: () => void;
  showBrandLogo?: boolean;
}

const VIEW_TITLES: Record<MainViewId, string> = {
  overview: 'Tablero Ejecutivo Consolidado',
  sectors: 'Análisis Operativo por Sector',
  divisions: 'Divisiones y Plantas Operativas',
  methodology: 'Metodología Híbrida, ETL y Auditoría',
};

const DIVISIONS: Array<{ id: DivisionFilter; label: string }> = [
  { id: 'Grupo Consolidado', label: 'Grupo Consolidado (Defensa)' },
  { id: 'Weapon & Ammunition', label: 'Weapon & Ammunition (Unterlüß / Murcia)' },
  { id: 'Vehicle Systems', label: 'Vehicle Systems (Kassel / Telford)' },
  { id: 'Electronic Solutions', label: 'Electronic Solutions (Bremen / Zúrich)' },
];

const QUICK_PERIODS: Array<{ id: PeriodFilter; label: string }> = [
  { id: '9M-2026', label: '9M' },
  { id: 'FY-2026', label: 'FY 26' },
  { id: 'Q1 2026', label: 'Q1' },
  { id: 'Q2 2026', label: 'Q2' },
  { id: 'Q3 2026', label: 'Q3' },
  { id: 'Q4 2026', label: 'Q4' },
];

export function TopBar({
  activeView,
  persona,
  division,
  onDivisionChange,
  period,
  onPeriodChange,
  dataOriginLabel,
  isDivisionalQuarterlyOnly,
  onOpenMobileMenu,
  showBrandLogo = false,
}: TopBarProps) {
  const activePersona = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];
  const isMonthSelected = period.startsWith('2026-');
  const monthDisabled = isDivisionalQuarterlyOnly || activeView === 'divisions';

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex flex-col gap-2 px-4 py-2.5 xl:flex-row xl:items-center xl:justify-between xl:px-6">
        {/* Left: Mobile Trigger + Title + Active Role Pill */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="rounded-md border border-[var(--border-color)] p-1.5 text-[var(--text-primary)] lg:hidden"
              aria-label="Abrir menú lateral"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div
              className={`items-center border-r pr-3 ${showBrandLogo ? 'flex' : 'flex lg:hidden'}`}
              style={{ borderColor: 'var(--border-color)' }}
            >
              <RheinmetallLogo className="h-[22px] w-auto block -translate-y-[3px]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-[17px]">
                  {VIEW_TITLES[activeView]}
                </h1>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: 'var(--accent-blue-soft)',
                    color: 'var(--accent-blue)',
                  }}
                >
                  {activePersona.shortLabel}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                <Database className="h-3 w-3" style={{ color: 'var(--accent-blue)' }} />
                <span>{dataOriginLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Clean Division Select (hidden on Divisiones) + Period Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {activeView !== 'divisions' && (
            <select
              aria-label="Seleccionar división operativa"
              value={division}
              onChange={(e) => onDivisionChange(e.target.value as DivisionFilter)}
              className="cursor-pointer rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2 py-1 text-[11px] font-medium text-[var(--text-primary)] outline-none transition hover:border-[var(--border-strong)]"
            >
              {DIVISIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] p-0.5">
            {QUICK_PERIODS.map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPeriodChange(p.id)}
                  className="cursor-pointer rounded px-2 py-1 text-[11px] font-medium transition"
                  style={
                    active
                      ? {
                        backgroundColor: 'var(--accent-blue-soft)',
                        color: 'var(--accent-blue)',
                        fontWeight: 600,
                      }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <select
              aria-label="Seleccionar mes específico"
              disabled={monthDisabled}
              value={isMonthSelected && !monthDisabled ? period : ''}
              onChange={(e) => {
                if (e.target.value) onPeriodChange(e.target.value as PeriodFilter);
              }}
              className={`rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2 py-1 text-[11px] font-medium text-[var(--text-primary)] outline-none ${
                monthDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:border-[#007EC1]'
              }`}
              title={
                monthDisabled
                  ? 'Las vistas divisionales usan períodos trimestrales (Q1–Q4) o acumulados (9M / FY)'
                  : 'Filtrar un mes puntual'
              }
            >
              <option value="">
                {monthDisabled ? 'Mes (Solo Consolidado)' : 'Mes...'}
              </option>
              {DATASET.serie_mensual_2026.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.mes}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
