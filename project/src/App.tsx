import { useEffect, useMemo, useState } from 'react';
import { KpiDetailModal } from './components/common/KpiDetailModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DivisionalView } from './components/views/DivisionalView';
import { ExecutiveOverview } from './components/views/ExecutiveOverview';
import { MethodologyView } from './components/views/MethodologyView';
import { SectorDeepDive } from './components/views/SectorDeepDive';
import { getPeriodSnapshot, normalizePeriodForDivision } from './utils/kpiEngine';
import type {
  DivisionFilter,
  EvaluatedKpi,
  MainViewId,
  PeriodFilter,
  PersonaId,
  SectorId,
} from './types/kpi';

const VALID_VIEWS: MainViewId[] = ['overview', 'sectors', 'divisions', 'methodology'];

const MONTHLY_SEQUENCE: PeriodFilter[] = [
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
  '2026-11',
  '2026-12',
];

const QUARTERLY_SEQUENCE: PeriodFilter[] = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];

interface ModalState {
  kpi: EvaluatedKpi;
  periodLabel: string;
  divisionLabel: string;
  period: PeriodFilter;
}

function getInitialViewFromHash(): MainViewId {
  if (typeof window === 'undefined') return 'divisions';
  const raw = window.location.hash.replace(/^#\/?/, '') as MainViewId;
  return VALID_VIEWS.includes(raw) ? raw : 'divisions';
}

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  try {
    const queryTheme = new URLSearchParams(window.location.search).get('theme');
    if (queryTheme === 'dark' || queryTheme === 'light') return queryTheme;
    const saved = window.localStorage.getItem('rhm-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage access restrictions
  }
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);
  const [persona, setPersona] = useState<PersonaId>('coo');
  const [division, setDivision] = useState<DivisionFilter>('Grupo Consolidado');
  const [period, setPeriod] = useState<PeriodFilter>('9M-2026');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState<MainViewId>(getInitialViewFromHash);
  const [activeSector, setActiveSector] = useState<SectorId>('ventas');
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('rhm-theme', theme);
    } catch {
      // Ignore storage access restrictions
    }
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => setActiveView(getInitialViewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const snapshot = useMemo(() => getPeriodSnapshot(period, division), [period, division]);

  const useQuarterlyPlayback =
    division !== 'Grupo Consolidado' || activeView === 'divisions';

  useEffect(() => {
    if (!isPlaying) return;
    const sequence = useQuarterlyPlayback ? QUARTERLY_SEQUENCE : MONTHLY_SEQUENCE;
    const intervalMs = useQuarterlyPlayback ? 1300 : 1100;
    const timer = window.setInterval(() => {
      setPeriod((prev) => {
        const idx = sequence.indexOf(prev);
        if (idx < 0) return sequence[0];
        if (idx >= sequence.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return sequence[idx + 1];
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, useQuarterlyPlayback]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    const sequence = useQuarterlyPlayback ? QUARTERLY_SEQUENCE : MONTHLY_SEQUENCE;
    const currentIdx = sequence.indexOf(period);
    if (currentIdx < 0 || currentIdx >= sequence.length - 1) {
      setPeriod(sequence[0]);
    }
    setIsPlaying(true);
  };

  const handleManualPeriodChange = (nextPeriod: PeriodFilter) => {
    setIsPlaying(false);
    setPeriod(nextPeriod);
  };

  const handleChangeView = (view: MainViewId) => {
    setActiveView(view);
    window.location.hash = `#/${view}`;
  };

  const handleDivisionChange = (nextDivision: DivisionFilter) => {
    setIsPlaying(false);
    setDivision(nextDivision);
    setPeriod((prev) => normalizePeriodForDivision(prev, nextDivision));
  };

  const handleDivisionAndPeriodSelect = (nextDivision: DivisionFilter, nextPeriod: PeriodFilter) => {
    setIsPlaying(false);
    setDivision(nextDivision);
    setPeriod(normalizePeriodForDivision(nextPeriod, nextDivision));
    handleChangeView('overview');
  };

  const handleSelectSector = (sectorId: SectorId) => {
    setActiveSector(sectorId);
    handleChangeView('sectors');
  };

  const handleInspectKpi = (
    kpi: EvaluatedKpi,
    context?: { period: PeriodFilter; division: DivisionFilter }
  ) => {
    if (context) {
      const ctxSnap = getPeriodSnapshot(context.period, context.division);
      setModalState({
        kpi,
        periodLabel: ctxSnap.periodLabel,
        divisionLabel: ctxSnap.division,
        period: ctxSnap.period,
      });
      return;
    }
    setModalState({
      kpi,
      periodLabel: snapshot.periodLabel,
      divisionLabel: snapshot.division,
      period: snapshot.period,
    });
  };

  const topBarSnapshot = useMemo(() => {
    if (activeView === 'divisions' && snapshot.period.startsWith('2026-')) {
      return getPeriodSnapshot(
        normalizePeriodForDivision(snapshot.period, 'Weapon & Ammunition'),
        'Grupo Consolidado'
      );
    }
    return snapshot;
  }, [activeView, snapshot]);

  const alertCount = snapshot.counts.preventivo + snapshot.counts.critico;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <Sidebar
        activeView={activeView}
        onChangeView={handleChangeView}
        activeSector={activeSector}
        onSelectSector={setActiveSector}
        persona={persona}
        onPersonaChange={setPersona}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        alertCount={alertCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeView={activeView}
          persona={persona}
          division={division}
          onDivisionChange={handleDivisionChange}
          period={topBarSnapshot.period}
          onPeriodChange={handleManualPeriodChange}
          dataOriginLabel={topBarSnapshot.dataOriginLabel}
          isDivisionalQuarterlyOnly={snapshot.isDivisionalQuarterlyOnly}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          showBrandLogo={sidebarCollapsed}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
        />

        <main className="mx-auto w-full max-w-[1260px] flex-1 px-5 py-7 lg:px-8">
          {activeView === 'overview' && (
            <ExecutiveOverview
              snapshot={snapshot}
              persona={persona}
              onInspectKpi={handleInspectKpi}
              onSelectSector={handleSelectSector}
              onSelectPeriod={handleManualPeriodChange}
            />
          )}

          {activeView === 'sectors' && (
            <SectorDeepDive
              snapshot={snapshot}
              activeSector={activeSector}
              persona={persona}
              onSelectSector={setActiveSector}
              onInspectKpi={handleInspectKpi}
              onSelectPeriod={handleManualPeriodChange}
            />
          )}

          {activeView === 'divisions' && (
            <DivisionalView
              period={snapshot.period}
              onSelectDivision={(nextDiv) => {
                handleDivisionChange(nextDiv);
                handleChangeView('overview');
              }}
              onSelectPeriod={handleManualPeriodChange}
              onSelectDivisionAndPeriod={handleDivisionAndPeriodSelect}
              onInspectKpi={handleInspectKpi}
            />
          )}

          {activeView === 'methodology' && <MethodologyView />}
        </main>

        <footer
          className="border-t py-4 text-center text-xs text-[var(--text-muted)]"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <div className="mx-auto flex max-w-[1260px] flex-col items-center justify-between gap-2 px-5 sm:flex-row lg:px-8">
            <span>
              Rheinmetall AG · Tablero de Control Estratégico y KPI 2026 (Modelo Híbrido Auditado / Simulado Calibrado)
            </span>
            <span className="font-mono-num">
              Universidad Blas Pascal · Informática Industrial · Molina Tomas & Karpowicz Edgar
            </span>
          </div>
        </footer>
      </div>

      <KpiDetailModal
        kpi={modalState?.kpi ?? null}
        periodLabel={modalState?.periodLabel ?? snapshot.periodLabel}
        divisionLabel={modalState?.divisionLabel ?? snapshot.division}
        activePeriod={modalState?.period ?? snapshot.period}
        onClose={() => setModalState(null)}
      />
    </div>
  );
}

export default App;
