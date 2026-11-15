export type KpiStatus = 'Óptimo' | 'Preventivo' | 'Crítico';

export type KpiCode =
  | 'KPI-1.1'
  | 'KPI-1.2'
  | 'KPI-2.1'
  | 'KPI-2.2'
  | 'KPI-3.1'
  | 'KPI-3.2'
  | 'KPI-4.1'
  | 'KPI-4.2'
  | 'KPI-5.1'
  | 'KPI-5.2';

export type SectorId =
  | 'ventas'
  | 'produccion'
  | 'calidad'
  | 'compras'
  | 'seguridad';

export type DivisionFilter =
  | 'Grupo Consolidado'
  | 'Weapon & Ammunition'
  | 'Vehicle Systems'
  | 'Electronic Solutions';

export type PeriodFilter =
  | '9M-2026'
  | 'FY-2026'
  | 'Q1 2026'
  | 'Q2 2026'
  | 'Q3 2026'
  | 'Q4 2026'
  | '2026-01'
  | '2026-02'
  | '2026-03'
  | '2026-04'
  | '2026-05'
  | '2026-06'
  | '2026-07'
  | '2026-08'
  | '2026-09'
  | '2026-10'
  | '2026-11'
  | '2026-12';

export type PersonaId =
  | 'coo'
  | 'plant-manager'
  | 'qa-qc'
  | 'vp-supply'
  | 'ehs-manager';

export type MainViewId =
  | 'overview'
  | 'sectors'
  | 'divisions'
  | 'methodology';

export interface MonthlyRecord {
  id: string;
  mes: string;
  corto: string;
  trimestre: string;
  dias: number;
  tipo_dato: string;
  ventas: number;
  pedidos: number;
  ebit: number;
  t_plan: number;
  t_real: number;
  c_ideal: number;
  p_tot: number;
  p_conf: number;
  mps_plan: number;
  mps_real: number;
  lotes_pres: number;
  lotes_ret: number;
  inv_prom: number;
  mat_cons: number;
  oc_tot: number;
  oc_otif: number;
  ehs_rep: number;
  ehs_cer: number;
  hh_trab: number;
  acc_baja: number;
  disp_pct: number;
  rend_pct: number;
  cal_pct: number;
  kpi_1_1_btb: number;
  kpi_1_1_estado: KpiStatus;
  kpi_1_2_margen: number;
  kpi_1_2_estado: KpiStatus;
  kpi_2_1_oee: number;
  kpi_2_1_estado: KpiStatus;
  kpi_2_2_mps: number;
  kpi_2_2_estado: KpiStatus;
  kpi_3_1_fpy: number;
  kpi_3_1_estado: KpiStatus;
  kpi_3_2_rechazo: number;
  kpi_3_2_estado: KpiStatus;
  kpi_4_1_dos: number;
  kpi_4_1_estado: KpiStatus;
  kpi_4_2_otif: number;
  kpi_4_2_estado: KpiStatus;
  kpi_5_1_ehs: number;
  kpi_5_1_estado: KpiStatus;
  kpi_5_2_ltifr: number;
  kpi_5_2_estado: KpiStatus;
}

export interface DivisionalRecord {
  division: Exclude<DivisionFilter, 'Grupo Consolidado'>;
  planta: string;
  trimestre: string;
  origen: string;
  ventas_meur: number;
  pedidos_meur: number;
  btb: number;
  margen_pct: number;
  oee_pct: number;
  mps_pct: number;
  fpy_pct: number;
  rechazo_lotes_pct: number;
  dos_dias: number;
  otif_pct: number;
  cierre_ehs_pct: number;
  ltifr: number;
}

export interface CatalogKpiRaw {
  codigo: KpiCode;
  sector: string;
  nombre: string;
  tipo: string;
  unidad: string;
  meta: string;
  verde: string;
  amarillo: string;
  rojo: string;
  formula: string;
  herramienta: string;
  responsable: string;
  protocolo: string;
}

export interface MethodologyLayer {
  capa: string;
  alcance: string;
  fuente_oficial: string;
  valores_reales_verificables: string;
  donde_inicia_sintetico: string;
}

export interface DatasetMetadata {
  organizacion: string;
  proyecto: string;
  institucion: string;
  asignatura: string;
  profesor: string;
  alumnos: string[];
  fecha_entrega: string;
  codigo_srs: string;
  codigo_anexo: string;
  horizonte: string;
}

export interface RheinmetallDataset {
  metadata: DatasetMetadata;
  fuentes_y_metodologia: MethodologyLayer[];
  catalogo_kpis: CatalogKpiRaw[];
  serie_mensual_2026: MonthlyRecord[];
  desglose_divisional_2026: DivisionalRecord[];
}

export interface SmartCriteria {
  S: string;
  M: string;
  A: string;
  R: string;
  T: string;
}

export interface EnrichedKpiMeta extends CatalogKpiRaw {
  sectorId: SectorId;
  objetivoId: string;
  isLeading: boolean;
  frecuenciaMedicion: string;
  capaDatos: string;
  descripcionProposito: string;
  preguntaNegocio: string;
  justificacionEstrategica: string;
  indicadoresBase: string[];
  justificacionObtencion: string;
  smart: SmartCriteria;
  metaTargetNumeric: number | [number, number];
}

export interface SectorInfo {
  id: SectorId;
  numero: number;
  nombre: string;
  subtituloEn: string;
  objetivoId: string;
  objetivoTexto: string;
  sistemasEtl: string;
  decisorPrincipal: string;
  leadingCode: KpiCode;
  laggingCode: KpiCode;
}

export interface PersonaProfile {
  id: PersonaId;
  shortLabel: string;
  rol: string;
  nivel: string;
  responsabilidad: string;
  focusSectors: SectorId[];
  primaryKpis: KpiCode[];
}

export interface PrimarySourceRef {
  id: string;
  documento: string;
  uso: string;
  url: string;
}

export interface BaseFormulaInput {
  label: string;
  value: string;
}

export interface EvaluatedKpi {
  meta: EnrichedKpiMeta;
  value: number;
  formattedValue: string;
  status: KpiStatus;
  compliancePct: number;
  deltaLabel: string;
  advisoryNote?: string;
  actionBrief?: string;
  protocolTriggered: boolean;
  baseInputs: BaseFormulaInput[];
  trendSeries: Array<{ label: string; value: number }>;
}

export interface PeriodSnapshot {
  period: PeriodFilter;
  division: DivisionFilter;
  periodLabel: string;
  dataOriginLabel: string;
  isDivisionalQuarterlyOnly: boolean;
  plantReference: string;
  ventasMeur: number;
  pedidosMeur: number;
  ebitMeur: number;
  oeeBreakdown?: {
    disponibilidadPct: number;
    rendimientoPct: number;
    calidadPct: number;
    horasPlanificadas: number;
    horasReales: number;
    cicloIdealMin: number;
    piezasTotales: number;
    piezasConformes: number;
  };
  rawTotals?: {
    mpsPlan: number;
    mpsReal: number;
    lotesPres: number;
    lotesRet: number;
    invProm: number;
    matCons: number;
    ocTot: number;
    ocOtif: number;
    ehsRep: number;
    ehsCer: number;
    hhTrab: number;
    accBaja: number;
  };
  kpis: Record<KpiCode, EvaluatedKpi>;
  counts: {
    optimo: number;
    preventivo: number;
    critico: number;
  };
}
