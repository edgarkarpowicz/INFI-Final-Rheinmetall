import { DATASET, KPI_META_BY_CODE } from '../data/kpiCatalogEnriched';
import { formatCurrencyMeur, formatIntEs, formatNumberEs } from './formatters';
import type {
  BaseFormulaInput,
  DivisionFilter,
  DivisionalRecord,
  EvaluatedKpi,
  KpiCode,
  KpiStatus,
  MonthlyRecord,
  PeriodFilter,
  PeriodSnapshot,
} from '../types/kpi';

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100;
const round1 = (v: number): number => Math.round((v + Number.EPSILON) * 10) / 10;
const sum = (arr: number[]): number => arr.reduce((acc, n) => acc + n, 0);
const avg = (arr: number[]): number => (arr.length ? sum(arr) / arr.length : 0);

export const ALL_KPI_CODES: KpiCode[] = [
  'KPI-1.1',
  'KPI-1.2',
  'KPI-2.1',
  'KPI-2.2',
  'KPI-3.1',
  'KPI-3.2',
  'KPI-4.1',
  'KPI-4.2',
  'KPI-5.1',
  'KPI-5.2',
];

export const DIVISION_PLANTS: Record<DivisionFilter, string> = {
  'Grupo Consolidado': 'Red Global Rheinmetall AG (Unterlüß, Kassel, Bremen, Murcia, Telford, Zúrich)',
  'Weapon & Ammunition': 'Unterlüß (DE) / Murcia (ES)',
  'Vehicle Systems': 'Kassel (DE) / Telford (UK)',
  'Electronic Solutions': 'Bremen (DE) / Zúrich (CH)',
};

export function evaluateStatus(code: KpiCode, value: number): KpiStatus {
  switch (code) {
    case 'KPI-1.1':
      return value >= 1.5 ? 'Óptimo' : value >= 1.1 ? 'Preventivo' : 'Crítico';
    case 'KPI-1.2':
      return value >= 18.0 ? 'Óptimo' : value >= 15.5 ? 'Preventivo' : 'Crítico';
    case 'KPI-2.1':
      return value >= 82.0 ? 'Óptimo' : value >= 75.0 ? 'Preventivo' : 'Crítico';
    case 'KPI-2.2':
      return value >= 95.0 ? 'Óptimo' : value >= 88.0 ? 'Preventivo' : 'Crítico';
    case 'KPI-3.1':
      return value >= 97.0 ? 'Óptimo' : value >= 94.0 ? 'Preventivo' : 'Crítico';
    case 'KPI-3.2':
      return value <= 1.5 ? 'Óptimo' : value <= 3.0 ? 'Preventivo' : 'Crítico';
    case 'KPI-4.1':
      if (value >= 65 && value <= 80) return 'Óptimo';
      if ((value >= 50 && value < 65) || (value > 80 && value <= 95)) return 'Preventivo';
      return 'Crítico';
    case 'KPI-4.2':
      return value >= 94.0 ? 'Óptimo' : value >= 87.0 ? 'Preventivo' : 'Crítico';
    case 'KPI-5.1':
      return value >= 95.0 ? 'Óptimo' : value >= 85.0 ? 'Preventivo' : 'Crítico';
    case 'KPI-5.2':
      return value <= 2.2 ? 'Óptimo' : value <= 3.2 ? 'Preventivo' : 'Crítico';
  }
}

export function computeCompliancePct(code: KpiCode, value: number): number {
  const target = KPI_META_BY_CODE[code].metaTargetNumeric;
  if (Array.isArray(target)) {
    const [min, max] = target;
    if (value >= min && value <= max) return 100;
    if (value < min) return round1((value / min) * 100);
    return round1((max / value) * 100);
  }
  // Low-is-good KPIs
  if (code === 'KPI-3.2' || code === 'KPI-5.2') {
    if (value <= target) return 100;
    return round1((target / value) * 100);
  }
  // High-is-good KPIs (cap display at 100% or show actual attainment? RF-01 % cumplimiento: show capped 100% for bar, exact % in delta)
  return round1(Math.min(100, (value / target) * 100));
}

export function computeDeltaLabel(code: KpiCode, value: number): string {
  const target = KPI_META_BY_CODE[code].metaTargetNumeric;
  if (Array.isArray(target)) {
    const [min, max] = target;
    if (value >= min && value <= max) return 'Dentro de banda óptima (65–80 d)';
    if (value < min) return `-${formatNumberEs(min - value, 1)} d bajo mínimo (65 d)`;
    return `+${formatNumberEs(value - max, 1)} d sobre máximo (80 d)`;
  }
  if (code === 'KPI-3.2' || code === 'KPI-5.2') {
    const diff = value - target;
    const unit = code === 'KPI-3.2' ? ' pp' : '';
    return diff <= 0
      ? `${formatNumberEs(Math.abs(diff), 2)}${unit} bajo límite`
      : `+${formatNumberEs(diff, 2)}${unit} sobre meta`;
  }
  const diff = value - target;
  const unit = code === 'KPI-1.1' ? 'x' : ' pp';
  return diff >= 0
    ? `+${formatNumberEs(diff, 2)}${unit} sobre meta`
    : `${formatNumberEs(diff, 2)}${unit} bajo meta`;
}

export function formatSingleKpiValue(code: KpiCode, value: number): string {
  if (code === 'KPI-1.1') return `${formatNumberEs(value, 2)}x`;
  if (code === 'KPI-4.1') return `${formatNumberEs(value, 1)} d`;
  if (code === 'KPI-5.2') return `${formatNumberEs(value, 2)}`;
  return `${formatNumberEs(value, 2)}%`;
}

export function isQuarterPeriod(p: PeriodFilter): boolean {
  return p === 'Q1 2026' || p === 'Q2 2026' || p === 'Q3 2026' || p === 'Q4 2026';
}

export function normalizePeriodForDivision(period: PeriodFilter, division: DivisionFilter): PeriodFilter {
  if (division === 'Grupo Consolidado') return period;
  if (period.startsWith('2026-')) {
    const m = Number(period.split('-')[1]);
    if (m <= 3) return 'Q1 2026';
    if (m <= 6) return 'Q2 2026';
    if (m <= 9) return 'Q3 2026';
    return 'Q4 2026';
  }
  return period;
}

function getMonthlySlice(period: PeriodFilter): MonthlyRecord[] {
  const all = DATASET.serie_mensual_2026;
  if (period === '9M-2026') return all.slice(0, 9);
  if (period === 'FY-2026') return all;
  if (isQuarterPeriod(period)) return all.filter((m) => m.trimestre === period);
  return all.filter((m) => m.id === period);
}

function getDivisionalSlice(
  division: Exclude<DivisionFilter, 'Grupo Consolidado'>,
  period: PeriodFilter
): DivisionalRecord[] {
  const rows = DATASET.desglose_divisional_2026.filter((d) => d.division === division);
  if (period === 'FY-2026') return rows;
  if (period === '9M-2026') return rows.filter((r) => r.trimestre !== 'Q4 2026');
  const q = normalizePeriodForDivision(period, division);
  return rows.filter((r) => r.trimestre === q);
}

function getPeriodMeta(period: PeriodFilter): { label: string; origin: string } {
  if (period === '9M-2026') {
    return { label: '9M 2026 (Ene–Sep Acumulado)', origin: '100% Anclado Reporte 9M Real' };
  }
  if (period === 'FY-2026') {
    return { label: 'FY 2026 (Anual Consolidado)', origin: '9M Real Auditado + Proyección Q4' };
  }
  if (period === 'Q4 2026') {
    return { label: 'Q4 2026 (Proyección Cierre)', origin: 'Proyección Calibrada Q4' };
  }
  if (isQuarterPeriod(period)) {
    return { label: period, origin: 'Real Auditado / Híbrido Calibrado' };
  }
  const month = DATASET.serie_mensual_2026.find((m) => m.id === period);
  return {
    label: month?.mes ?? period,
    origin: month?.tipo_dato ?? 'Real Auditado / Híbrido',
  };
}

const STATIC_ACTION_BRIEFS: Partial<Record<KpiCode, string>> = {
  'KPI-1.2': 'Indexar contratos y contener OPEX no crítico',
  'KPI-2.1': 'Atacar factor limitante (SMED, CNC o calibración)',
  'KPI-2.2': 'Turnos extra y balanceo Unterlüß / Murcia',
  'KPI-3.1': 'Análisis 5 Porqués y recalibrar visión/ultrasonido',
  'KPI-3.2': 'Pre-certificación interna previa a inspección GQAR',
  'KPI-4.2': 'Activar Dual Sourcing y auditoría SQE a proveedores',
  'KPI-5.1': 'Escalar hallazgos vencidos y bloquear celdas ATEX',
  'KPI-5.2': 'Safety Stand-Down y re-entrenamiento LOTO / ATEX',
};

function getWeakestOeeFactor(oeeBreakdown: NonNullable<PeriodSnapshot['oeeBreakdown']>) {
  return [
    {
      name: 'Disponibilidad',
      val: oeeBreakdown.disponibilidadPct,
      brief: 'Priorizar Disponibilidad (SMED y manto. preventivo)',
      action: 'mantenimiento preventivo autónomo y cambios rápidos SMED',
    },
    {
      name: 'Rendimiento',
      val: oeeBreakdown.rendimientoPct,
      brief: 'Priorizar Rendimiento (ajuste CNC y microparadas)',
      action: 'recalibrar parámetros CNC/robóticos y reducir microparadas',
    },
    {
      name: 'Calidad',
      val: oeeBreakdown.calidadPct,
      brief: 'Priorizar Calidad (calibración herramental y SPC)',
      action: 'detener estación para ajuste de herramental y control SPC',
    },
  ].sort((a, b) => a.val - b.val)[0];
}

function getAdvisoryNote(
  code: KpiCode,
  value: number,
  status: KpiStatus,
  oeeBreakdown?: PeriodSnapshot['oeeBreakdown']
): string | undefined {
  if (code === 'KPI-1.1' && value > 2.0) {
    return 'Alerta Positiva (> 2,00x): Aprobar ampliación de capacidad fabril (CapEx) por demanda sostenida.';
  }
  if (code === 'KPI-2.1' && status !== 'Óptimo' && oeeBreakdown) {
    const weakest = getWeakestOeeFactor(oeeBreakdown);
    return `Factor limitante principal: ${weakest.name} (${formatNumberEs(weakest.val, 2)}%) → Priorizar ${weakest.action}.`;
  }
  if (code === 'KPI-4.1' && status !== 'Óptimo') {
    return value > 80
      ? 'Desvío por exceso (> 80 d): Reprogramar entregas MRP no críticas y acelerar conversión WIP a producto facturable.'
      : 'Desvío por escasez (< 65 d): Disparar órdenes urgentes y activar reservas de nitrocelulosa y aceros balísticos.';
  }
  return undefined;
}

function getActionBrief(
  code: KpiCode,
  value: number,
  status: KpiStatus,
  oeeBreakdown?: PeriodSnapshot['oeeBreakdown']
): string | undefined {
  if (code === 'KPI-1.1') {
    if (value > 2.0) return 'Demanda > 2,0x: aprobar ampliación fabril';
    if (status !== 'Óptimo') return 'Auditar licitaciones OTAN pendientes';
    return undefined;
  }
  if (status === 'Óptimo') return undefined;
  if (code === 'KPI-2.1' && oeeBreakdown) {
    return getWeakestOeeFactor(oeeBreakdown).brief;
  }
  if (code === 'KPI-4.1') {
    return value > 80
      ? 'Exceso stock (> 80 d): reprogramar MRP y WIP'
      : 'Riesgo quiebre (< 65 d): compra urgente nitrocelulosa/acero';
  }
  return STATIC_ACTION_BRIEFS[code];
}

function buildEvaluatedKpi(
  code: KpiCode,
  value: number,
  baseInputs: BaseFormulaInput[],
  trendSeries: Array<{ label: string; value: number }>,
  oeeBreakdown?: PeriodSnapshot['oeeBreakdown']
): EvaluatedKpi {
  const meta = KPI_META_BY_CODE[code];
  const status = evaluateStatus(code, value);
  const compliancePct = computeCompliancePct(code, value);
  const deltaLabel = computeDeltaLabel(code, value);
  const advisoryNote = getAdvisoryNote(code, value, status, oeeBreakdown);
  const actionBrief = getActionBrief(code, value, status, oeeBreakdown);
  const protocolTriggered = status !== 'Óptimo' || (code === 'KPI-1.1' && value > 2.0);

  return {
    meta,
    value,
    formattedValue: formatSingleKpiValue(code, value),
    status,
    compliancePct,
    deltaLabel,
    advisoryNote,
    actionBrief,
    protocolTriggered,
    baseInputs,
    trendSeries,
  };
}

export function getPeriodSnapshot(period: PeriodFilter, division: DivisionFilter): PeriodSnapshot {
  const effectivePeriod = normalizePeriodForDivision(period, division);
  const { label: periodLabel, origin: dataOriginLabel } = getPeriodMeta(effectivePeriod);

  if (division === 'Grupo Consolidado') {
    const slice = getMonthlySlice(effectivePeriod);
    const allMonths = DATASET.serie_mensual_2026;

    const ventas = round2(sum(slice.map((m) => m.ventas)));
    const pedidos = round2(sum(slice.map((m) => m.pedidos)));
    const ebit = round2(sum(slice.map((m) => m.ebit)));
    const tPlan = sum(slice.map((m) => m.t_plan));
    const tReal = sum(slice.map((m) => m.t_real));
    const cIdeal = avg(slice.map((m) => m.c_ideal));
    const pTot = sum(slice.map((m) => m.p_tot));
    const pConf = sum(slice.map((m) => m.p_conf));
    const mpsPlan = sum(slice.map((m) => m.mps_plan));
    const mpsReal = sum(slice.map((m) => m.mps_real));
    const lotesPres = sum(slice.map((m) => m.lotes_pres));
    const lotesRet = sum(slice.map((m) => m.lotes_ret));
    const invProm = round2(avg(slice.map((m) => m.inv_prom)));
    const matCons = round2(sum(slice.map((m) => m.mat_cons)));
    const dias = sum(slice.map((m) => m.dias));
    const ocTot = sum(slice.map((m) => m.oc_tot));
    const ocOtif = sum(slice.map((m) => m.oc_otif));
    const ehsRep = sum(slice.map((m) => m.ehs_rep));
    const ehsCer = sum(slice.map((m) => m.ehs_cer));
    const hhTrab = round2(sum(slice.map((m) => m.hh_trab)));
    const accBaja = sum(slice.map((m) => m.acc_baja));

    // Sheet 3 exact aggregation formulas
    const kpi11 = round2(pedidos / ventas);
    const kpi12 = round2((ebit / ventas) * 100);
    const kpi21 = slice.length === 1 ? slice[0].kpi_2_1_oee : round2(avg(slice.map((m) => m.kpi_2_1_oee)));
    const kpi22 = round2((mpsReal / mpsPlan) * 100);
    const kpi31 = round2((pConf / pTot) * 100);
    const kpi32 = round2((lotesRet / lotesPres) * 100);
    const kpi41 = slice.length === 1 ? slice[0].kpi_4_1_dos : round1(avg(slice.map((m) => m.kpi_4_1_dos)));
    const kpi42 = round2((ocOtif / ocTot) * 100);
    const kpi51 = round2((ehsCer / ehsRep) * 100);
    const kpi52 = round2(accBaja / hhTrab);

    const dispPct = round2((tReal / tPlan) * 100);
    const rendPct = round2((((cIdeal / 60) * pTot) / tReal) * 100);
    const calPct = round2((pConf / pTot) * 100);

    const oeeBreakdown: PeriodSnapshot['oeeBreakdown'] = {
      disponibilidadPct: slice.length === 1 ? slice[0].disp_pct : dispPct,
      rendimientoPct: slice.length === 1 ? slice[0].rend_pct : rendPct,
      calidadPct: slice.length === 1 ? slice[0].cal_pct : calPct,
      horasPlanificadas: tPlan,
      horasReales: tReal,
      cicloIdealMin: round2(cIdeal),
      piezasTotales: pTot,
      piezasConformes: pConf,
    };

    const kpis: Record<KpiCode, EvaluatedKpi> = {
      'KPI-1.1': buildEvaluatedKpi(
        'KPI-1.1',
        kpi11,
        [
          { label: 'Nuevos Pedidos (Nomination)', value: formatCurrencyMeur(pedidos, 2) },
          { label: 'Ventas Facturadas', value: formatCurrencyMeur(ventas, 2) },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_1_1_btb }))
      ),
      'KPI-1.2': buildEvaluatedKpi(
        'KPI-1.2',
        kpi12,
        [
          { label: 'Resultado Operativo (EBIT)', value: formatCurrencyMeur(ebit, 2) },
          { label: 'Ventas Totales', value: formatCurrencyMeur(ventas, 2) },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_1_2_margen }))
      ),
      'KPI-2.1': buildEvaluatedKpi(
        'KPI-2.1',
        kpi21,
        [
          { label: 'Disponibilidad (Reales / Plan.)', value: `${formatNumberEs(oeeBreakdown.disponibilidadPct, 2)}% (${formatIntEs(tReal)} h / ${formatIntEs(tPlan)} h)` },
          { label: 'Rendimiento (Ciclo 1,80 min)', value: `${formatNumberEs(oeeBreakdown.rendimientoPct, 2)}%` },
          { label: 'Calidad (Conformes / Totales)', value: `${formatNumberEs(oeeBreakdown.calidadPct, 2)}%` },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_2_1_oee })),
        oeeBreakdown
      ),
      'KPI-2.2': buildEvaluatedKpi(
        'KPI-2.2',
        kpi22,
        [
          { label: 'Unidades Producidas Liberadas', value: formatIntEs(mpsReal) },
          { label: 'Unidades Planificadas MPS', value: formatIntEs(mpsPlan) },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_2_2_mps }))
      ),
      'KPI-3.1': buildEvaluatedKpi(
        'KPI-3.1',
        kpi31,
        [
          { label: 'Piezas Conformes (1ª Pasada)', value: formatIntEs(pConf) },
          { label: 'Total Piezas Inspeccionadas', value: formatIntEs(pTot) },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_3_1_fpy }))
      ),
      'KPI-3.2': buildEvaluatedKpi(
        'KPI-3.2',
        kpi32,
        [
          { label: 'Lotes Rechazados / Retenidos GQAR', value: formatIntEs(lotesRet) },
          { label: 'Total Lotes Presentados', value: formatIntEs(lotesPres) },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_3_2_rechazo }))
      ),
      'KPI-4.1': buildEvaluatedKpi(
        'KPI-4.1',
        kpi41,
        [
          { label: 'Inventario Promedio Operativo', value: formatCurrencyMeur(invProm, 2) },
          { label: 'Materiales Consumidos', value: formatCurrencyMeur(matCons, 2) },
          { label: 'Días del Período', value: `${dias} días` },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_4_1_dos }))
      ),
      'KPI-4.2': buildEvaluatedKpi(
        'KPI-4.2',
        kpi42,
        [
          { label: 'Órdenes Recibidas OTIF', value: formatIntEs(ocOtif) },
          { label: 'Órdenes Programadas Totales', value: formatIntEs(ocTot) },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_4_2_otif }))
      ),
      'KPI-5.1': buildEvaluatedKpi(
        'KPI-5.1',
        kpi51,
        [
          { label: 'Hallazgos Cerrados en SLA', value: formatIntEs(ehsCer) },
          { label: 'Total Hallazgos Reportados', value: formatIntEs(ehsRep) },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_5_1_ehs }))
      ),
      'KPI-5.2': buildEvaluatedKpi(
        'KPI-5.2',
        kpi52,
        [
          { label: 'Accidentes con Baja Médica', value: formatIntEs(accBaja) },
          { label: 'Horas-Hombre Trabajadas', value: `${formatNumberEs(hhTrab, 2)} M h` },
        ],
        allMonths.map((m) => ({ label: m.corto, value: m.kpi_5_2_ltifr }))
      ),
    };

    const counts = ALL_KPI_CODES.reduce(
      (acc, code) => {
        const s = kpis[code].status;
        if (s === 'Óptimo') acc.optimo += 1;
        else if (s === 'Preventivo') acc.preventivo += 1;
        else acc.critico += 1;
        return acc;
      },
      { optimo: 0, preventivo: 0, critico: 0 }
    );

    return {
      period: effectivePeriod,
      division,
      periodLabel,
      dataOriginLabel,
      isDivisionalQuarterlyOnly: false,
      plantReference: DIVISION_PLANTS[division],
      ventasMeur: ventas,
      pedidosMeur: pedidos,
      ebitMeur: ebit,
      oeeBreakdown,
      rawTotals: {
        mpsPlan,
        mpsReal,
        lotesPres,
        lotesRet,
        invProm,
        matCons,
        ocTot,
        ocOtif,
        ehsRep,
        ehsCer,
        hhTrab,
        accBaja,
      },
      kpis,
      counts,
    };
  }

  // Divisional view (quarterly granularity per dataset)
  const divRows = getDivisionalSlice(division, effectivePeriod);
  const allDivRows = DATASET.desglose_divisional_2026.filter((d) => d.division === division);
  const ventas = round2(sum(divRows.map((d) => d.ventas_meur)));
  const pedidos = round2(sum(divRows.map((d) => d.pedidos_meur)));
  const ebitEst = round2(sum(divRows.map((d) => (d.ventas_meur * d.margen_pct) / 100)));

  const kpi11 = divRows.length === 1 ? divRows[0].btb : round2(pedidos / ventas);
  const kpi12 = divRows.length === 1 ? divRows[0].margen_pct : round2((ebitEst / ventas) * 100);
  const kpi21 = round2(avg(divRows.map((d) => d.oee_pct)));
  const kpi22 = round2(avg(divRows.map((d) => d.mps_pct)));
  const kpi31 = round2(avg(divRows.map((d) => d.fpy_pct)));
  const kpi32 = round2(avg(divRows.map((d) => d.rechazo_lotes_pct)));
  const kpi41 = round1(avg(divRows.map((d) => d.dos_dias)));
  const kpi42 = round2(avg(divRows.map((d) => d.otif_pct)));
  const kpi51 = round2(avg(divRows.map((d) => d.cierre_ehs_pct)));
  const kpi52 = round2(avg(divRows.map((d) => d.ltifr)));

  const qTrend = (getter: (r: DivisionalRecord) => number) =>
    allDivRows.map((r) => ({ label: r.trimestre.replace(' 2026', ''), value: getter(r) }));

  const kpis: Record<KpiCode, EvaluatedKpi> = {
    'KPI-1.1': buildEvaluatedKpi(
      'KPI-1.1',
      kpi11,
      [
        { label: 'Pedidos División', value: formatCurrencyMeur(pedidos, 1) },
        { label: 'Ventas División', value: formatCurrencyMeur(ventas, 1) },
      ],
      qTrend((r) => r.btb)
    ),
    'KPI-1.2': buildEvaluatedKpi(
      'KPI-1.2',
      kpi12,
      [
        { label: 'EBIT Imputado División', value: formatCurrencyMeur(ebitEst, 2) },
        { label: 'Ventas División', value: formatCurrencyMeur(ventas, 1) },
      ],
      qTrend((r) => r.margen_pct)
    ),
    'KPI-2.1': buildEvaluatedKpi(
      'KPI-2.1',
      kpi21,
      [{ label: 'Planta Referencia', value: DIVISION_PLANTS[division] }],
      qTrend((r) => r.oee_pct)
    ),
    'KPI-2.2': buildEvaluatedKpi(
      'KPI-2.2',
      kpi22,
      [{ label: 'Adherencia MPS Divisional', value: `${formatNumberEs(kpi22, 2)}%` }],
      qTrend((r) => r.mps_pct)
    ),
    'KPI-3.1': buildEvaluatedKpi(
      'KPI-3.1',
      kpi31,
      [{ label: 'FPY Divisional (QMS AQAP-2110)', value: `${formatNumberEs(kpi31, 2)}%` }],
      qTrend((r) => r.fpy_pct)
    ),
    'KPI-3.2': buildEvaluatedKpi(
      'KPI-3.2',
      kpi32,
      [{ label: 'Rechazo/Retención GQAR Divisional', value: `${formatNumberEs(kpi32, 2)}%` }],
      qTrend((r) => r.rechazo_lotes_pct)
    ),
    'KPI-4.1': buildEvaluatedKpi(
      'KPI-4.1',
      kpi41,
      [{ label: 'Cobertura Inventario Divisional', value: `${formatNumberEs(kpi41, 1)} días` }],
      qTrend((r) => r.dos_dias)
    ),
    'KPI-4.2': buildEvaluatedKpi(
      'KPI-4.2',
      kpi42,
      [{ label: 'Supplier OTIF Divisional', value: `${formatNumberEs(kpi42, 2)}%` }],
      qTrend((r) => r.otif_pct)
    ),
    'KPI-5.1': buildEvaluatedKpi(
      'KPI-5.1',
      kpi51,
      [{ label: 'Cierre Proactivo EHS Divisional', value: `${formatNumberEs(kpi51, 2)}%` }],
      qTrend((r) => r.cierre_ehs_pct)
    ),
    'KPI-5.2': buildEvaluatedKpi(
      'KPI-5.2',
      kpi52,
      [{ label: 'LTIFR Divisional (ISO 45001)', value: `${formatNumberEs(kpi52, 2)}` }],
      qTrend((r) => r.ltifr)
    ),
  };

  const counts = ALL_KPI_CODES.reduce(
    (acc, code) => {
      const s = kpis[code].status;
      if (s === 'Óptimo') acc.optimo += 1;
      else if (s === 'Preventivo') acc.preventivo += 1;
      else acc.critico += 1;
      return acc;
    },
    { optimo: 0, preventivo: 0, critico: 0 }
  );

  return {
    period: effectivePeriod,
    division,
    periodLabel,
    dataOriginLabel: divRows[0]?.origen ?? dataOriginLabel,
    isDivisionalQuarterlyOnly: true,
    plantReference: DIVISION_PLANTS[division],
    ventasMeur: ventas,
    pedidosMeur: pedidos,
    ebitMeur: ebitEst,
    kpis,
    counts,
  };
}

export interface QuarterlyConsolidatedSummary {
  periodo: string;
  clasificacion: string;
  ventas: number;
  pedidos: number;
  btb: number;
  ebit: number;
  margen: number;
  oee: number;
  mps: number;
  fpy: number;
  rechazo: number;
  dos: number;
  otif: number;
  ehs: number;
  ltifr: number;
}

export function getQuarterlyAndAnnualSummary(): QuarterlyConsolidatedSummary[] {
  const periods: Array<{ filter: PeriodFilter; label: string; clasif: string }> = [
    { filter: 'Q1 2026', label: 'Q1 2026', clasif: 'Real Auditado / Híbrido' },
    { filter: 'Q2 2026', label: 'Q2 2026', clasif: 'Real Auditado / Híbrido' },
    { filter: 'Q3 2026', label: 'Q3 2026', clasif: 'Real Auditado / Híbrido' },
    { filter: '9M-2026', label: '9M 2026 (Acum.)', clasif: '100% Anclado Reporte 9M' },
    { filter: 'Q4 2026', label: 'Q4 2026 (Proy.)', clasif: 'Proyección Cierre 2026' },
    { filter: 'FY-2026', label: 'FY 2026 (Anual)', clasif: 'Consolidado Anual 2026' },
  ];

  return periods.map(({ filter, label, clasif }) => {
    const snap = getPeriodSnapshot(filter, 'Grupo Consolidado');
    return {
      periodo: label,
      clasificacion: clasif,
      ventas: snap.ventasMeur,
      pedidos: snap.pedidosMeur,
      btb: snap.kpis['KPI-1.1'].value,
      ebit: snap.ebitMeur,
      margen: snap.kpis['KPI-1.2'].value,
      oee: snap.kpis['KPI-2.1'].value,
      mps: snap.kpis['KPI-2.2'].value,
      fpy: snap.kpis['KPI-3.1'].value,
      rechazo: snap.kpis['KPI-3.2'].value,
      dos: snap.kpis['KPI-4.1'].value,
      otif: snap.kpis['KPI-4.2'].value,
      ehs: snap.kpis['KPI-5.1'].value,
      ltifr: snap.kpis['KPI-5.2'].value,
    };
  });
}
