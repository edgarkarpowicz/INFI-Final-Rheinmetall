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

function getInitialViewFromHash(): MainViewId {
  const raw = window.location.hash.replace(/^#\/?/, '') as MainViewId;
  return VALID_VIEWS.includes(raw) ? raw : 'divisions';
}

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [persona, setPersona] = useState<PersonaId>('coo');
  const [division, setDivision] = useState<DivisionFilter>('Grupo Consolidado');
  const [period, setPeriod] = useState<PeriodFilter>('9M-2026');
  const [activeView, setActiveView] = useState<MainViewId>(getInitialViewFromHash);
  const [activeSector, setActiveSector] = useState<SectorId>('ventas');
  const [inspectedKpi, setInspectedKpi] = useState<EvaluatedKpi | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => setActiveView(getInitialViewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleChangeView = (view: MainViewId) => {
    setActiveView(view);
    window.location.hash = `#/${view}`;
  };

  const handleDivisionChange = (nextDivision: DivisionFilter) => {
    setDivision(nextDivision);
    setPeriod((prev) => normalizePeriodForDivision(prev, nextDivision));
  };

  const handleSelectSector = (sectorId: SectorId) => {
    setActiveSector(sectorId);
    handleChangeView('sectors');
  };

  const snapshot = useMemo(
    () => getPeriodSnapshot(period, division),
    [period, division]
  );

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
          onPeriodChange={setPeriod}
          dataOriginLabel={topBarSnapshot.dataOriginLabel}
          isDivisionalQuarterlyOnly={snapshot.isDivisionalQuarterlyOnly}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          showBrandLogo={sidebarCollapsed}
        />

        <main className="mx-auto w-full max-w-[1260px] flex-1 px-5 py-7 lg:px-8">
          {activeView === 'overview' && (
            <ExecutiveOverview
              snapshot={snapshot}
              persona={persona}
              onInspectKpi={setInspectedKpi}
              onSelectSector={handleSelectSector}
            />
          )}

          {activeView === 'sectors' && (
            <SectorDeepDive
              snapshot={snapshot}
              activeSector={activeSector}
              persona={persona}
              onSelectSector={setActiveSector}
              onInspectKpi={setInspectedKpi}
            />
          )}

          {activeView === 'divisions' && (
            <DivisionalView
              period={snapshot.period}
              onSelectDivision={(nextDiv) => {
                handleDivisionChange(nextDiv);
                handleChangeView('overview');
              }}
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
        kpi={inspectedKpi}
        periodLabel={snapshot.periodLabel}
        divisionLabel={snapshot.division}
        onClose={() => setInspectedKpi(null)}
      />
    </div>
  );
}

export default App;
