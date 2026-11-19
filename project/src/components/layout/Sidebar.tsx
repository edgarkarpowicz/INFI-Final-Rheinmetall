import {
  Activity,
  BookOpen,
  Factory,
  Globe,
  HardHat,
  LayoutDashboard,
  Moon,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sun,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import { PERSONAS, SECTORS } from '../../data/kpiCatalogEnriched';
import { RheinmetallLogo, RheinmetallMark } from '../common/RheinmetallLogo';
import type { MainViewId, PersonaId, SectorId } from '../../types/kpi';

interface SidebarProps {
  activeView: MainViewId;
  onChangeView: (v: MainViewId) => void;
  activeSector: SectorId;
  onSelectSector: (s: SectorId) => void;
  persona: PersonaId;
  onPersonaChange: (p: PersonaId) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  alertCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const NAV_ITEMS: Array<{ id: MainViewId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'divisions', label: 'Divisiones (3)', icon: Factory },
  { id: 'overview', label: 'Tablero Ejecutivo', icon: LayoutDashboard },
  { id: 'sectors', label: 'Sectores (5)', icon: Activity },
  { id: 'methodology', label: 'Metodología & Datos', icon: BookOpen },
];

const PERSONA_ICONS: Record<PersonaId, typeof Globe> = {
  coo: Globe,
  'plant-manager': Wrench,
  'qa-qc': ShieldCheck,
  'vp-supply': Package,
  'ehs-manager': HardHat,
};

export function Sidebar({
  activeView,
  onChangeView,
  activeSector,
  onSelectSector,
  persona,
  onPersonaChange,
  theme,
  onToggleTheme,
  alertCount,
  mobileOpen,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const activePersonaObj = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];

  const handleNav = (id: MainViewId) => {
    onChangeView(id);
    onCloseMobile();
  };

  const handlePersona = (pId: PersonaId) => {
    onPersonaChange(pId);
    const profile = PERSONAS.find((p) => p.id === pId);
    if (profile && activeView === 'sectors' && !profile.focusSectors.includes(activeSector)) {
      onSelectSector(profile.focusSectors[0]);
    }
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          collapsed ? 'w-60 lg:w-16' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
          color: 'var(--sidebar-text)',
        }}
      >
        <div className="flex flex-col overflow-y-auto overflow-x-hidden">
          {/* Brand Header + Collapse Control */}
          <div
            className={`flex items-center border-b px-3 py-3 ${
              collapsed ? 'lg:flex-col lg:gap-2 lg:px-2' : 'justify-between'
            }`}
            style={{ borderColor: 'var(--sidebar-border)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <RheinmetallLogo className={collapsed ? 'h-6 w-auto block -translate-y-[3px] lg:hidden' : 'h-6 w-auto block -translate-y-[3px]'} />
              {collapsed && (
                <RheinmetallMark className="hidden h-7 w-auto lg:block" />
              )}
            </div>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden cursor-pointer rounded p-1.5 text-[var(--sidebar-muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] lg:inline-flex"
                aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral (solo iconos)'}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded p-1 text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text)] lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className={collapsed ? 'px-2 pt-3' : 'px-2.5 pt-3.5'}>
            <div
              className={`px-2 pb-1 text-[9px] font-semibold uppercase tracking-widest text-[var(--sidebar-muted)] ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              Navegación
            </div>
            <nav className="space-y-1" aria-label="Menú principal">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleNav(item.id)}
                      title={item.label}
                      aria-label={item.label}
                      className={`relative cursor-pointer flex w-full items-center rounded-md text-xs font-medium transition hover:bg-[var(--sidebar-hover)] ${
                        collapsed
                          ? 'justify-between px-2.5 py-2 lg:justify-center lg:px-0 lg:py-2.5'
                          : 'justify-between px-2.5 py-1.5'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: 'var(--sidebar-active-bg)',
                              color: 'var(--sidebar-active-text)',
                            }
                          : { color: 'var(--sidebar-text)' }
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                        <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                      </span>
                      {item.id === 'overview' && alertCount > 0 && (
                        <>
                          <span
                            className={`rounded-full px-1.5 py-0.5 font-mono-num text-[9px] font-semibold ${
                              collapsed ? 'lg:hidden' : ''
                            }`}
                            style={
                              active
                                ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'inherit' }
                                : {
                                    backgroundColor: 'var(--status-yellow-bg)',
                                    color: 'var(--status-yellow-text)',
                                  }
                            }
                          >
                            {alertCount}
                          </span>
                          {collapsed && (
                            <span
                              className="hidden h-1.5 w-1.5 rounded-full lg:block lg:absolute lg:top-1.5 lg:right-2"
                              style={{ backgroundColor: 'var(--status-yellow)' }}
                            />
                          )}
                        </>
                      )}
                    </button>

                    {/* Quick Sector Jump directly under Sectores when active and expanded */}
                    {item.id === 'sectors' && activeView === 'sectors' && !collapsed && (
                      <div
                        className="mt-1 ml-3 space-y-0.5 border-l pl-2.5"
                        style={{ borderColor: 'var(--sidebar-border)' }}
                      >
                        {SECTORS.map((s) => {
                          const isFocus = activePersonaObj.focusSectors.includes(s.id);
                          const sectorActive = activeSector === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                onSelectSector(s.id);
                                onCloseMobile();
                              }}
                              className="cursor-pointer flex w-full items-center justify-between rounded px-2 py-1 text-left text-[11px] transition hover:bg-[var(--sidebar-hover)]"
                              style={
                                sectorActive
                                  ? {
                                      backgroundColor: 'var(--sidebar-card-active-bg)',
                                      color: 'var(--accent-blue)',
                                      fontWeight: 600,
                                    }
                                  : { color: 'var(--sidebar-muted)' }
                              }
                            >
                              <span>
                                {s.numero}. {s.nombre}
                              </span>
                              {persona !== 'coo' && isFocus && (
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: 'var(--accent-blue)' }}
                                  title="En foco de tu perfil"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Interactive Stakeholder Profiles (SRS §5) — Always Clickable Even Collapsed */}
          <div
            className={`mt-4 border-t pt-3 ${collapsed ? 'px-2' : 'px-2.5'}`}
            style={{ borderColor: 'var(--sidebar-border)' }}
          >
            <div
              className={`flex items-center gap-1.5 px-2 pb-1 text-[9px] font-semibold uppercase tracking-widest text-[var(--sidebar-muted)] ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              <UserCheck className="h-3 w-3" style={{ color: 'var(--accent-blue)' }} />
              Perfil Decisor (SRS §5)
            </div>
            <div className="space-y-1">
              {PERSONAS.map((p) => {
                const active = persona === p.id;
                const PersonaIcon = PERSONA_ICONS[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePersona(p.id)}
                    title={`${p.shortLabel} · ${p.nivel} (${p.primaryKpis.length} KPIs)`}
                    aria-label={p.rol}
                    className={`cursor-pointer flex w-full items-center rounded-md border text-left transition hover:bg-[var(--sidebar-hover)] ${
                      collapsed
                        ? 'justify-between px-2.5 py-1.5 lg:justify-center lg:px-0 lg:py-2'
                        : 'justify-between px-2.5 py-1.5'
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: 'var(--sidebar-card-active-bg)',
                            borderColor: 'var(--sidebar-card-active-border)',
                            color: 'var(--accent-blue)',
                          }
                        : {
                            backgroundColor: 'transparent',
                            borderColor: 'transparent',
                            color: 'var(--sidebar-text)',
                          }
                    }
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <PersonaIcon className="h-3.5 w-3.5 shrink-0 opacity-85" />
                      <span
                        className={`truncate text-[11px] ${active ? 'font-semibold' : 'font-medium'} ${
                          collapsed ? 'lg:hidden' : ''
                        }`}
                      >
                        {p.shortLabel}
                      </span>
                    </span>
                    <span
                      className={`font-mono-num text-[9px] text-[var(--sidebar-muted)] ${
                        collapsed ? 'lg:hidden' : ''
                      }`}
                    >
                      {p.primaryKpis.length} KPIs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Theme Toggle & Compact Footer */}
        <div
          className={`space-y-2 border-t ${collapsed ? 'p-2' : 'p-2.5'}`}
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Modo Sala Control (Oscuro)' : 'Modo Ejecutivo (Claro)'}
            aria-label={theme === 'light' ? 'Modo Sala Control (Oscuro)' : 'Modo Ejecutivo (Claro)'}
            className={`cursor-pointer flex w-full items-center rounded-md border text-[11px] font-medium transition hover:border-[var(--border-strong)] ${
              collapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
            }`}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="flex items-center gap-2">
              {theme === 'light' ? (
                <>
                  <Moon className="h-3.5 w-3.5 shrink-0 text-[var(--accent-blue)]" />
                  <span className={collapsed ? 'lg:hidden' : ''}>Modo Sala Control (Oscuro)</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 shrink-0 text-[var(--status-yellow-text)]" />
                  <span className={collapsed ? 'lg:hidden' : ''}>Modo Ejecutivo (Claro)</span>
                </>
              )}
            </span>
          </button>

          {!collapsed && (
            <div className="px-1 text-[9px] leading-snug text-[var(--sidebar-muted)]">
              <div className="font-medium text-[var(--sidebar-text)]">UBP · Informática Industrial</div>
              <div>Molina T. & Karpowicz E.</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
