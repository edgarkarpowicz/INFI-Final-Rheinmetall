import { describe, expect, it } from 'vitest';
import { DATASET } from '../data/kpiCatalogEnriched';
import {
  computeCompliancePct,
  evaluateStatus,
  getPeriodSnapshot,
  getQuarterlyAndAnnualSummary,
} from './kpiEngine';

describe('Rheinmetall KPI Engine — Excel Parity & Threshold Rules', () => {
  it('matches all 12 monthly records against precomputed JSON/Excel statuses', () => {
    for (const m of DATASET.serie_mensual_2026) {
      expect(evaluateStatus('KPI-1.1', m.kpi_1_1_btb)).toBe(m.kpi_1_1_estado);
      expect(evaluateStatus('KPI-1.2', m.kpi_1_2_margen)).toBe(m.kpi_1_2_estado);
      expect(evaluateStatus('KPI-2.1', m.kpi_2_1_oee)).toBe(m.kpi_2_1_estado);
      expect(evaluateStatus('KPI-2.2', m.kpi_2_2_mps)).toBe(m.kpi_2_2_estado);
      expect(evaluateStatus('KPI-3.1', m.kpi_3_1_fpy)).toBe(m.kpi_3_1_estado);
      expect(evaluateStatus('KPI-3.2', m.kpi_3_2_rechazo)).toBe(m.kpi_3_2_estado);
      expect(evaluateStatus('KPI-4.1', m.kpi_4_1_dos)).toBe(m.kpi_4_1_estado);
      expect(evaluateStatus('KPI-4.2', m.kpi_4_2_otif)).toBe(m.kpi_4_2_estado);
      expect(evaluateStatus('KPI-5.1', m.kpi_5_1_ehs)).toBe(m.kpi_5_1_estado);
      expect(evaluateStatus('KPI-5.2', m.kpi_5_2_ltifr)).toBe(m.kpi_5_2_estado);
    }
  });

  it('reconciles 9M 2026 audited figures exactly with Excel Sheet 3', () => {
    const snap = getPeriodSnapshot('9M-2026', 'Grupo Consolidado');
    expect(snap.ventasMeur).toBe(8376);
    expect(snap.pedidosMeur).toBe(19100);
    expect(snap.ebitMeur).toBe(1340.16);
    expect(snap.kpis['KPI-1.1'].value).toBe(2.28);
    expect(snap.kpis['KPI-1.2'].value).toBe(16.0);
    expect(snap.kpis['KPI-2.1'].value).toBe(79.11);
    expect(snap.kpis['KPI-2.2'].value).toBe(94.08);
    expect(snap.kpis['KPI-3.1'].value).toBe(96.83);
    expect(snap.kpis['KPI-3.2'].value).toBe(2.1);
    expect(snap.kpis['KPI-4.1'].value).toBe(83.1);
    expect(snap.kpis['KPI-4.2'].value).toBe(92.53);
    expect(snap.kpis['KPI-5.1'].value).toBe(95.22);
    expect(snap.kpis['KPI-5.2'].value).toBe(2.18);
  });

  it('reconciles Q1–Q4 and FY 2026 rollups exactly with Excel Sheet 3', () => {
    const summary = getQuarterlyAndAnnualSummary();
    const q1 = summary.find((s) => s.periodo === 'Q1 2026')!;
    const q2 = summary.find((s) => s.periodo === 'Q2 2026')!;
    const q3 = summary.find((s) => s.periodo === 'Q3 2026')!;
    const q4 = summary.find((s) => s.periodo === 'Q4 2026 (Proy.)')!;
    const fy = summary.find((s) => s.periodo === 'FY 2026 (Anual)')!;

    expect(q1.ventas).toBe(2480);
    expect(q1.btb).toBe(2.36);
    expect(q1.oee).toBe(74.89);

    expect(q2.ventas).toBe(2820);
    expect(q2.rechazo).toBe(2.22);
    expect(q2.ltifr).toBe(2.36);

    expect(q3.ventas).toBe(3076);
    expect(q3.dos).toBe(78.3);

    expect(q4.ventas).toBe(4424);
    expect(q4.margen).toBe(22.08);
    expect(q4.rechazo).toBe(1.13);

    expect(fy.ventas).toBe(12800);
    expect(fy.pedidos).toBe(27000);
    expect(fy.ebit).toBe(2316.8);
    expect(fy.btb).toBe(2.11);
    expect(fy.margen).toBe(18.1);
    expect(fy.oee).toBe(80.92);
    expect(fy.mps).toBe(94.97);
    expect(fy.fpy).toBe(97.18);
    expect(fy.rechazo).toBe(1.81);
    expect(fy.dos).toBe(80.3);
    expect(fy.otif).toBe(93.45);
    expect(fy.ehs).toBe(95.98);
    expect(fy.ltifr).toBe(2.09);
  });

  it('handles bidirectional DOS thresholds and compliance percentages cleanly', () => {
    expect(evaluateStatus('KPI-4.1', 49.9)).toBe('Crítico');
    expect(evaluateStatus('KPI-4.1', 50)).toBe('Preventivo');
    expect(evaluateStatus('KPI-4.1', 65)).toBe('Óptimo');
    expect(evaluateStatus('KPI-4.1', 80)).toBe('Óptimo');
    expect(evaluateStatus('KPI-4.1', 80.3)).toBe('Preventivo');
    expect(evaluateStatus('KPI-4.1', 95.1)).toBe('Crítico');

    expect(computeCompliancePct('KPI-4.1', 72)).toBe(100);
    expect(computeCompliancePct('KPI-3.2', 1.5)).toBe(100);
    expect(computeCompliancePct('KPI-3.2', 3.0)).toBe(50);
  });

  it('supports divisional filtering and quarterly normalization', () => {
    const snap = getPeriodSnapshot('2026-08', 'Weapon & Ammunition');
    expect(snap.period).toBe('Q3 2026');
    expect(snap.isDivisionalQuarterlyOnly).toBe(true);
    expect(snap.ventasMeur).toBe(1095);
    expect(snap.kpis['KPI-1.1'].value).toBe(2.64);
    expect(snap.kpis['KPI-1.2'].value).toBe(21.4);
    expect(snap.rawTotals).toBeUndefined();
  });
});
