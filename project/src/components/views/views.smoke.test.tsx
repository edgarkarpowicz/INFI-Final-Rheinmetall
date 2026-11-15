import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PERSONAS, SECTORS } from '../../data/kpiCatalogEnriched';
import { ALL_KPI_CODES, getPeriodSnapshot } from '../../utils/kpiEngine';
import { KpiDetailModal } from '../common/KpiDetailModal';
import { Sidebar } from '../layout/Sidebar';
import { TopBar } from '../layout/TopBar';
import { DivisionalView } from './DivisionalView';
import { ExecutiveOverview } from './ExecutiveOverview';
import { MethodologyView } from './MethodologyView';
import { SectorDeepDive } from './SectorDeepDive';

describe('Dashboard UI Views & Layout — Render Smoke Tests', () => {
  it('renders ExecutiveOverview cleanly for COO (9M 2026) and Plant Manager (FY 2026)', () => {
    const snap9m = getPeriodSnapshot('9M-2026', 'Grupo Consolidado');
    const html9m = renderToStaticMarkup(
      <ExecutiveOverview
        snapshot={snap9m}
        persona="coo"
        onInspectKpi={() => {}}
        onSelectSector={() => {}}
      />
    );
    expect(html9m).toContain('8.376,0M');
    expect((html9m.match(/8\.376,0M/g) ?? []).length).toBe(1);
    expect(html9m).not.toContain('Consolidado Grupo:');
    expect(html9m).toContain('19.100,0M');
    expect(html9m).toContain('1.340,16M');
    expect(html9m).toContain('KPI-1.1');
    expect(html9m).toContain('KPI-5.2');
    expect(html9m).toContain('Alerta CapEx:');
    expect(html9m).toContain('Demanda &gt; 2,0x: aprobar ampliación fabril');
    expect(html9m).toContain('Acción:');
    expect(html9m).toContain('Indexar contratos y contener OPEX no crítico');
    expect(html9m).not.toContain('sectores adicionales');

    const snapFy = getPeriodSnapshot('FY-2026', 'Grupo Consolidado');
    const htmlFyCoo = renderToStaticMarkup(
      <ExecutiveOverview
        snapshot={snapFy}
        persona="coo"
        onInspectKpi={() => {}}
        onSelectSector={() => {}}
      />
    );
    expect(htmlFyCoo).toContain('12.800,0M');
    expect(htmlFyCoo).toContain('27.000,0M');
    expect(htmlFyCoo).toContain('2.316,80M');

    const htmlFyPlant = renderToStaticMarkup(
      <ExecutiveOverview
        snapshot={snapFy}
        persona="plant-manager"
        onInspectKpi={() => {}}
        onSelectSector={() => {}}
      />
    );
    expect(htmlFyPlant).toContain('OEE Línea Productiva (KPI-2.1)');
    expect(htmlFyPlant).toContain('Cumplimiento MPS (KPI-2.2)');
    expect(htmlFyPlant).toContain('Ver 3 sectores adicionales');
    expect(htmlFyPlant).not.toContain('Ref. Grupo:');
    expect(htmlFyPlant).not.toContain('12.800,0M');
    expect(htmlFyPlant).not.toContain('27.000,0M');
    expect(htmlFyPlant).not.toContain('2.316,80M');
  });

  it('adapts ExecutiveOverview summary cards, focus sectors and protocol filters for every non-COO role', () => {
    const snap9m = getPeriodSnapshot('9M-2026', 'Grupo Consolidado');
    const expectedHeadings = [
      { id: 'plant-manager' as const, card: 'OEE Línea Productiva (KPI-2.1)' },
      { id: 'qa-qc' as const, card: 'First-Pass Yield — FPY (KPI-3.1)' },
      { id: 'vp-supply' as const, card: 'Días de Inventario — DOS (KPI-4.1)' },
      { id: 'ehs-manager' as const, card: 'Cierre Proactivo EHS (KPI-5.1)' },
    ];

    for (const item of expectedHeadings) {
      const profile = PERSONAS.find((p) => p.id === item.id)!;
      const html = renderToStaticMarkup(
        <ExecutiveOverview
          snapshot={snap9m}
          persona={item.id}
          onInspectKpi={() => {}}
          onSelectSector={() => {}}
        />
      );
      expect(html).toContain(item.card);
      expect(html).toContain(profile.rol);
      expect(html).toContain('Mi perfil (');
      expect(html).toContain('sectores adicionales');
      expect(html).not.toContain('Ref. Grupo:');
      if (item.id !== 'vp-supply') {
        expect(html).not.toContain('8.376,0M');
        expect(html).not.toContain('19.100,0M');
      }
      expect(html).not.toContain('1.340,16M');
      expect(html).not.toContain('Preventivo / Preventivo');
    }
  });

  it('renders DivisionalView and Sidebar/TopBar layout chrome cleanly', () => {
    const divHtml = renderToStaticMarkup(
      <DivisionalView period="9M-2026" onSelectDivision={() => {}} />
    );
    expect(divHtml).toContain('División Defensa');
    expect((divHtml.match(/División Defensa/g) ?? []).length).toBe(1);
    expect(divHtml).toContain('Filtrar tablero: Grupo Consolidado');
    expect(divHtml).toContain('8.376,0M');
    expect(divHtml).toContain('19.100,0M');
    expect(divHtml).toContain('2,28x');
    expect(divHtml).toContain('Estado KPIs (10)');
    expect(divHtml).not.toContain('3Ó');
    expect(divHtml).toContain('Weapon &amp; Ammunition');
    expect(divHtml).toContain('Vehicle Systems');
    expect(divHtml).toContain('Electronic Solutions');
    expect(divHtml).toContain('Filtrar tablero en esta división');

    const sidebarHtml = renderToStaticMarkup(
      <Sidebar
        activeView="divisions"
        onChangeView={() => {}}
        activeSector="ventas"
        onSelectSector={() => {}}
        persona="vp-supply"
        onPersonaChange={() => {}}
        theme="light"
        onToggleTheme={() => {}}
        alertCount={6}
        mobileOpen={false}
        onCloseMobile={() => {}}
      />
    );
    expect(sidebarHtml).toContain('RHEINMETALL');
    expect(sidebarHtml).toContain('Divisiones (3)');
    expect(sidebarHtml).toContain('Perfil Decisor (SRS §5)');
    expect(sidebarHtml).toContain('Modo Sala Control (Oscuro)');

    const idxDiv = sidebarHtml.indexOf('Divisiones (3)');
    const idxOver = sidebarHtml.indexOf('Tablero Ejecutivo');
    const idxSec = sidebarHtml.indexOf('Sectores (5)');
    const idxMeth = sidebarHtml.indexOf('Metodología &amp; Datos');
    expect(idxDiv).toBeGreaterThan(-1);
    expect(idxDiv).toBeLessThan(idxOver);
    expect(idxOver).toBeLessThan(idxSec);
    expect(idxSec).toBeLessThan(idxMeth);

    const sectorsSidebarHtml = renderToStaticMarkup(
      <Sidebar
        activeView="sectors"
        onChangeView={() => {}}
        activeSector="calidad"
        onSelectSector={() => {}}
        persona="coo"
        onPersonaChange={() => {}}
        theme="light"
        onToggleTheme={() => {}}
        alertCount={6}
        mobileOpen={false}
        onCloseMobile={() => {}}
      />
    );
    const sSec = sectorsSidebarHtml.indexOf('Sectores (5)');
    const sItem = sectorsSidebarHtml.indexOf('1. Ventas');
    const sMeth = sectorsSidebarHtml.indexOf('Metodología &amp; Datos');
    expect(sSec).toBeLessThan(sItem);
    expect(sItem).toBeLessThan(sMeth);

    const collapsedSidebarHtml = renderToStaticMarkup(
      <Sidebar
        activeView="overview"
        onChangeView={() => {}}
        activeSector="ventas"
        onSelectSector={() => {}}
        persona="coo"
        onPersonaChange={() => {}}
        theme="light"
        onToggleTheme={() => {}}
        alertCount={6}
        mobileOpen={false}
        onCloseMobile={() => {}}
        collapsed={true}
        onToggleCollapse={() => {}}
      />
    );
    expect(collapsedSidebarHtml).toContain('lg:w-16');
    expect(collapsedSidebarHtml).toContain('Expandir barra lateral');
    expect(collapsedSidebarHtml).toContain('aria-label="Tablero Ejecutivo"');
    expect(collapsedSidebarHtml).toContain('RHEINMETALL');

    const topBarHtml = renderToStaticMarkup(
      <TopBar
        activeView="overview"
        persona="vp-supply"
        division="Vehicle Systems"
        onDivisionChange={() => {}}
        period="9M-2026"
        onPeriodChange={() => {}}
        dataOriginLabel="100% Anclado Reporte 9M Real"
        isDivisionalQuarterlyOnly={true}
        onOpenMobileMenu={() => {}}
      />
    );
    expect(topBarHtml).toContain('Tablero Ejecutivo Consolidado');
    expect(topBarHtml).toContain('VP Compras');
    expect(topBarHtml).toContain('Seleccionar división operativa');
    expect(topBarHtml).toContain('Vehicle Systems (Kassel / Telford)');

    const topBarDivisionsHtml = renderToStaticMarkup(
      <TopBar
        activeView="divisions"
        persona="coo"
        division="Grupo Consolidado"
        onDivisionChange={() => {}}
        period="9M-2026"
        onPeriodChange={() => {}}
        dataOriginLabel="100% Anclado Reporte 9M Real"
        isDivisionalQuarterlyOnly={false}
        onOpenMobileMenu={() => {}}
      />
    );
    expect(topBarDivisionsHtml).toContain('Divisiones y Plantas Operativas');
    expect(topBarDivisionsHtml).not.toContain('Seleccionar división operativa');
  });

  it('renders SectorDeepDive cleanly across all 5 strategic sectors with persona focus tags', () => {
    const snap = getPeriodSnapshot('9M-2026', 'Grupo Consolidado');
    for (const sector of SECTORS) {
      const html = renderToStaticMarkup(
        <SectorDeepDive
          snapshot={snap}
          activeSector={sector.id}
          persona="plant-manager"
          onSelectSector={() => {}}
          onInspectKpi={() => {}}
        />
      );
      expect(html).toContain(sector.objetivoId);
      expect(html).toContain(sector.nombre);
      expect(html).toContain('Foco');
    }
  });

  it('renders MethodologyView cleanly', () => {
    const methHtml = renderToStaticMarkup(<MethodologyView />);
    expect(methHtml).toContain('SRC-01');
    expect(methHtml).toContain('AQAP-2110');
    expect(methHtml).toContain('ISO 45001');
  });

  it('renders KpiDetailModal for all 10 KPIs with formula and protocol', () => {
    const snap = getPeriodSnapshot('9M-2026', 'Grupo Consolidado');
    for (const code of ALL_KPI_CODES) {
      const kpi = snap.kpis[code];
      const html = renderToStaticMarkup(
        <KpiDetailModal
          kpi={kpi}
          periodLabel={snap.periodLabel}
          divisionLabel={snap.division}
          onClose={() => {}}
        />
      );
      const unescaped = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      expect(unescaped).toContain(code);
      expect(unescaped).toContain(kpi.meta.unidad);
      expect(unescaped).toContain(kpi.meta.indicadoresBase[0]);
      expect(unescaped).toContain(kpi.meta.protocolo);
      expect(unescaped).toContain(kpi.meta.frecuenciaMedicion);
    }
  });
});
