import rawDataset from './rheinmetall_kpi_2026.json';
import type {
  EnrichedKpiMeta,
  KpiCode,
  PersonaProfile,
  PrimarySourceRef,
  RheinmetallDataset,
  SectorId,
  SectorInfo,
} from '../types/kpi';

export const DATASET = rawDataset as RheinmetallDataset;

export const SECTORS: SectorInfo[] = [
  {
    id: 'ventas',
    numero: 1,
    nombre: 'Ventas',
    subtituloEn: 'Sales & Commercial Execution',
    objetivoId: 'OE-01',
    objetivoTexto:
      'Capitalizar el incremento estructural del gasto en defensa europeo mediante la conversión ágil de licitaciones gubernamentales en contratos plurianuales firmes, sosteniendo un margen operativo consolidado superior al 18,0% durante el ejercicio fiscal 2026.',
    sistemasEtl: 'SAP S/4HANA (SD, FI/CO), CRM Defensa',
    decisorPrincipal: 'COO / CFO Corporativo',
    leadingCode: 'KPI-1.1',
    laggingCode: 'KPI-1.2',
  },
  {
    id: 'produccion',
    numero: 2,
    nombre: 'Línea de Producción',
    subtituloEn: 'Production Line Operations',
    objetivoId: 'OE-02',
    objetivoTexto:
      'Maximizar la eficiencia y utilización de la capacidad instalada en las líneas automatizadas de manufactura y ensamblaje, alcanzando un OEE superior al 82,0% y un cumplimiento del plan maestro de al menos 95,0% durante 2026.',
    sistemasEtl: 'Siemens Opcenter MES, PLC/SCADA, SAP PP',
    decisorPrincipal: 'Director de Planta (Plant Manager)',
    leadingCode: 'KPI-2.1',
    laggingCode: 'KPI-2.2',
  },
  {
    id: 'calidad',
    numero: 3,
    nombre: 'Calidad',
    subtituloEn: 'Quality Assurance & Ballistic Compliance',
    objetivoId: 'OE-03',
    objetivoTexto:
      'Asegurar la excelencia técnica y conformidad normativa bajo estándares militares OTAN (AQAP-2110), logrando un rendimiento a la primera (FPY) superior al 97,0% y reduciendo los rechazos o demoras en aceptación de lotes por debajo del 1,5% en 2026.',
    sistemasEtl: 'QMS AQAP-2110, SAP QM, Polígonos END',
    decisorPrincipal: 'Gerente de Calidad (QA/QC)',
    leadingCode: 'KPI-3.1',
    laggingCode: 'KPI-3.2',
  },
  {
    id: 'compras',
    numero: 4,
    nombre: 'Compras y Abastecimiento',
    subtituloEn: 'Procurement & Supply Chain',
    objetivoId: 'OE-04',
    objetivoTexto:
      'Blindar la continuidad operativa de las plantas frente a las tensiones globales de suministro, logrando una confiabilidad de entrega de proveedores críticos (OTIF) superior al 94,0% y manteniendo los días de inventario dentro de una banda óptima de 65 a 80 días.',
    sistemasEtl: 'SAP S/4HANA (MM), SAP EWM, SAP Ariba',
    decisorPrincipal: 'VP de Compras y Supply Chain',
    leadingCode: 'KPI-4.1',
    laggingCode: 'KPI-4.2',
  },
  {
    id: 'seguridad',
    numero: 5,
    nombre: 'Seguridad (EHS)',
    subtituloEn: 'Occupational Health & Safety — EHS',
    objetivoId: 'OE-05',
    objetivoTexto:
      'Consolidar una cultura industrial de Cero Daño (Zero Harm) en todas las instalaciones de manufactura pesada y materiales energéticos, manteniendo el índice de frecuencia de accidentes con baja (LTIFR) por debajo de 2,20 y cerrando al menos el 95,0% de los riesgos preventivos en plazo.',
    sistemasEtl: 'SAP EHS Management, SAP SuccessFactors',
    decisorPrincipal: 'Gerente Corporativo EHS',
    leadingCode: 'KPI-5.1',
    laggingCode: 'KPI-5.2',
  },
];

export const SECTOR_BY_ID: Record<SectorId, SectorInfo> = Object.fromEntries(
  SECTORS.map((s) => [s.id, s])
) as Record<SectorId, SectorInfo>;

export const PERSONAS: PersonaProfile[] = [
  {
    id: 'coo',
    shortLabel: 'COO · Global',
    rol: 'Director de Operaciones (COO)',
    nivel: 'Ejecutivo (C-Level)',
    responsabilidad:
      'Supervisa la sincronización global entre entrada de pedidos, capacidad fabril y liberación de lotes, reasignando inversiones (CapEx) ante cuellos de botella.',
    focusSectors: ['ventas', 'produccion', 'calidad', 'compras', 'seguridad'],
    primaryKpis: ['KPI-1.1', 'KPI-1.2', 'KPI-2.1', 'KPI-2.2', 'KPI-3.1', 'KPI-3.2', 'KPI-4.1', 'KPI-4.2', 'KPI-5.1', 'KPI-5.2'],
  },
  {
    id: 'plant-manager',
    shortLabel: 'Dir. de Planta',
    rol: 'Director de Planta (Plant Manager)',
    nivel: 'Gerencial / Planta',
    responsabilidad:
      'Monitorea el OEE y cumplimiento semanal en plantas clave (Unterlüß, Kassel, Murcia), gestionando turnos, mantenimiento preventivo y dotación operativa.',
    focusSectors: ['produccion', 'seguridad'],
    primaryKpis: ['KPI-2.1', 'KPI-2.2', 'KPI-5.1', 'KPI-5.2'],
  },
  {
    id: 'qa-qc',
    shortLabel: 'Gerente QA/QC',
    rol: 'Gerente de Calidad (QA/QC)',
    nivel: 'Gerencial / Técnico',
    responsabilidad:
      'Audita tasas de retrabajo en línea y coordina con inspectores gubernamentales (GQAR) para destrabar demoras en certificación balística.',
    focusSectors: ['calidad', 'produccion'],
    primaryKpis: ['KPI-3.1', 'KPI-3.2', 'KPI-2.1'],
  },
  {
    id: 'vp-supply',
    shortLabel: 'VP Compras',
    rol: 'VP de Compras y Supply Chain',
    nivel: 'Ejecutivo / Táctico',
    responsabilidad:
      'Evalúa proveedores de materias primas energéticas y componentes mecánicos, activando doble abastecimiento (Dual Sourcing) o ajustando stocks de seguridad.',
    focusSectors: ['compras', 'ventas'],
    primaryKpis: ['KPI-4.1', 'KPI-4.2', 'KPI-1.1'],
  },
  {
    id: 'ehs-manager',
    shortLabel: 'Gerente EHS',
    rol: 'Gerente de Seguridad (EHS)',
    nivel: 'Gerencial / Normativo',
    responsabilidad:
      'Vigila la accidentabilidad en tiempo real y exige el cierre inmediato de hallazgos preventivos en zonas ATEX antes de que escalen a incidentes graves.',
    focusSectors: ['seguridad'],
    primaryKpis: ['KPI-5.1', 'KPI-5.2'],
  },
];

export const PRIMARY_SOURCES: PrimarySourceRef[] = [
  {
    id: 'SRC-01',
    documento: 'Rheinmetall AG — Financial Reports (Annual Report FY25 & Q1–Q3 2026)',
    uso: 'Ventas consolidadas (€9.935M FY25; €8.376M 9M26), Rheinmetall Nomination (€19.100M 9M26), Backlog (€78.000M 9M 2026) y Margen Operativo (18,5% FY25; 16,0% 9M26).',
    url: 'https://www.rheinmetall.com/en/investor-relations/publications/financial-publications-and-presentations',
  },
  {
    id: 'SRC-02',
    documento: 'Rheinmetall AG — Investor Relations & Corporate Presentations',
    uso: 'Guidance anual 2026, desglose divisional (Weapon & Ammunition, Vehicle Systems, Electronic Solutions), CapEx y notas sobre demoras de aceptación de lotes.',
    url: 'https://www.rheinmetall.com/en/investor-relations/publications/financial-publications-and-presentations',
  },
  {
    id: 'SRC-03',
    documento: 'Rheinmetall AG — Non-Financial Statement & Sustainability (ESG)',
    uso: 'Indicadores corporativos de seguridad laboral (LTIFR / ISO 45001), dotación de personal (>31.000 empleados) y gobernanza industrial.',
    url: 'https://www.rheinmetall.com/en/suppliers/sustainability',
  },
  {
    id: 'SRC-04',
    documento: 'Rheinmetall AG — Corporate History & Global Locations',
    uso: 'Evolución histórica desde 1889 (Heinrich Ehrhardt), incorporación al DAX 40 y red de plantas en Alemania (Unterlüß, Kassel, Bremen) y España (Expal).',
    url: 'https://www.rheinmetall.com/en/company/history/history-overview',
  },
  {
    id: 'SRC-05',
    documento: 'OTAN / NATO Standardization Office — Norma AQAP-2110',
    uso: 'Marco normativo de aseguramiento de la calidad para diseño, desarrollo y producción en contratos de defensa y aceptación gubernamental (GQAR).',
    url: 'https://nso.nato.int/nso/nsdd/main/standards/ap-details/2286/EN',
  },
  {
    id: 'SRC-06',
    documento: 'ISO 45001 — Occupational Health and Safety Management Systems',
    uso: 'Estándar internacional de cálculo para el índice de frecuencia de accidentes con baja médica (LTIFR por 1.000.000 horas trabajadas).',
    url: 'https://www.iso.org/iso-45001-occupational-health-and-safety.html',
  },
];

interface AnnexEnrichment {
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
  smart: { S: string; M: string; A: string; R: string; T: string };
  metaTargetNumeric: number | [number, number];
}

const ANNEX_ENRICHMENT: Record<KpiCode, AnnexEnrichment> = {
  'KPI-1.1': {
    sectorId: 'ventas',
    objetivoId: 'OE-01',
    isLeading: true,
    frecuenciaMedicion: 'Trimestral (seguimiento mensual)',
    capaDatos: 'Capa 1 · Datos Corporativos Reales (Auditados / Públicos)',
    descripcionProposito:
      'Mide el cociente entre el valor monetario de nuevos contratos firmados (Rheinmetall Nomination) y las ventas facturadas en el mismo período. Su propósito es anticipar la carga fabril futura a 12–36 meses y dimensionar las inversiones de capacidad instalada (CapEx).',
    preguntaNegocio:
      '¿Está logrando la fuerza comercial reponer y expandir nuestra cartera de pedidos a un ritmo superior al de nuestra facturación actual?',
    justificacionEstrategica:
      'A diferencia de contar ofertas enviadas (indicador operativo), mide la expansión neta real del backlog frente a la capacidad de entrega.',
    indicadoresBase: [
      'Valor de nuevos pedidos captados (Rheinmetall Nomination) [€]',
      'Ventas consolidadas facturadas [€]',
    ],
    justificacionObtencion:
      'Extraído directamente de los reportes financieros oficiales de Rheinmetall AG. En 9M 2026, registró entrada de pedidos real de €19.100M frente a ventas de €8.376M (2,28x).',
    smart: {
      S: 'Captación comercial vs. facturación en Defensa',
      M: 'Cociente numérico (€/€)',
      A: 'Respaldado por presupuestos OTAN aprobados',
      R: 'Garantiza visibilidad plurianual',
      T: 'Evaluación trimestral FY26',
    },
    metaTargetNumeric: 1.5,
  },
  'KPI-1.2': {
    sectorId: 'ventas',
    objetivoId: 'OE-01',
    isLeading: false,
    frecuenciaMedicion: 'Trimestral (cierre contable)',
    capaDatos: 'Capa 1 · Datos Corporativos Reales (Auditados / Públicos)',
    descripcionProposito:
      'Representa el porcentaje de utilidad operativa (EBIT ajustado) generado por cada euro facturado. Audita que el acelerado crecimiento del volumen de ventas no deteriore la rentabilidad por sobrecostos de expansión, inflación de insumos o penalidades.',
    preguntaNegocio:
      '¿Qué porcentaje de nuestras ventas se convierte efectivamente en beneficio operativo tras absorber los costos de producción, ingeniería y estructura?',
    justificacionEstrategica:
      'Mientras la facturación bruta mide tamaño, el Margen Operativo determina la creación real de valor y la capacidad de autofinanciamiento de CapEx.',
    indicadoresBase: [
      'Resultado operativo consolidado (EBIT) [€]',
      'Ventas totales facturadas [€]',
    ],
    justificacionObtencion:
      'Extraído de los estados financieros auditados de Rheinmetall AG. En FY 2025 alcanzó un récord real del 18,5%; en 9M 2026 marcó 16,0% por costos de arranque y demoras en munición, proyectando cerrar ≥ 18,0%.',
    smart: {
      S: 'Rentabilidad operativa neta sobre ventas',
      M: 'Porcentaje auditado',
      A: 'Histórico comprobado de 18,5%',
      R: 'Autofinancia expansión industrial',
      T: 'Cierre trimestral y anual 2026',
    },
    metaTargetNumeric: 18.0,
  },
  'KPI-2.1': {
    sectorId: 'produccion',
    objetivoId: 'OE-02',
    isLeading: true,
    frecuenciaMedicion: 'Diaria / Semanal (consolidación mensual)',
    capaDatos: 'Capa 2 · Datos Industriales Simulados Calibrados (Piso de Planta MES)',
    descripcionProposito:
      'Métrica compuesta estándar en manufactura de clase mundial que multiplica Disponibilidad × Rendimiento × Calidad. Permite identificar pérdidas ocultas de capacidad (microparadas, tiempos excesivos de cambio de formato, averías o baja velocidad de ciclo) en las líneas automatizadas de forja, mecanizado y llenado.',
    preguntaNegocio:
      '¿Qué porcentaje del tiempo productivo teórico de nuestras líneas críticas se está traduciendo realmente en piezas terminadas sin defectos a velocidad nominal?',
    justificacionEstrategica:
      'A diferencia de medir solo horas de máquina encendida, el OEE determina si Rheinmetall puede alcanzar sus metas de producción masiva (>700.000 proyectiles/año) sin invertir en líneas adicionales.',
    indicadoresBase: [
      'Tiempo operativo real vs. planificado (Disponibilidad)',
      'Velocidad/tiempo de ciclo ideal 1,80 min vs. real (Rendimiento)',
      'Piezas conformes vs. totales producidas (Calidad)',
    ],
    justificacionObtencion:
      'Dado que Rheinmetall no divulga telemetría interna de máquinas por seguridad nacional, se utiliza un dataset simulado calibrado a escala industrial modelando las líneas de Unterlüß (Alemania) y Murcia (España) vía PLC/SCADA.',
    smart: {
      S: 'Eficiencia efectiva de celdas críticas',
      M: 'Producto porcentual de 3 sub-indicadores',
      A: 'Benchmark europeo 80–85%',
      R: 'Maximiza capacidad instalada',
      T: 'Seguimiento diario y mensual 2026',
    },
    metaTargetNumeric: 82.0,
  },
  'KPI-2.2': {
    sectorId: 'produccion',
    objetivoId: 'OE-02',
    isLeading: false,
    frecuenciaMedicion: 'Semanal y Mensual',
    capaDatos: 'Capa 2 · Datos Industriales Simulados Calibrados (Piso de Planta MES)',
    descripcionProposito:
      'Mide el grado de adherencia entre la cantidad de unidades o sistemas efectivamente fabricados y liberados por planta respecto al volumen comprometido en el Programa Maestro de Producción (MPS). Garantiza la sincronización entre fábrica y compromisos contractuales estatales.',
    preguntaNegocio:
      '¿Están nuestras plantas fabricando en tiempo y forma las cantidades exactas comprometidas en el cronograma maestro de entregas?',
    justificacionEstrategica:
      'El volumen bruto producido carece de contexto si no se contrasta contra el compromiso contractual, donde los retrasos acarrean penalidades gubernamentales.',
    indicadoresBase: [
      'Unidades reales producidas y liberadas por planta',
      'Unidades planificadas en el Programa Maestro (MPS)',
    ],
    justificacionObtencion:
      'Calculado mediante un dataset simulado calibrado que cruza las órdenes planificadas en SAP PP contra los reportes de producción terminada en MES durante el escalamiento operativo de 2026.',
    smart: {
      S: 'Adherencia al plan maestro por línea/planta',
      M: 'Porcentaje exacto de unidades',
      A: 'Meta estándar del 95%',
      R: 'Asegura facturación trimestral puntual',
      T: 'Corte semanal y mensual 2026',
    },
    metaTargetNumeric: 95.0,
  },
  'KPI-3.1': {
    sectorId: 'calidad',
    objetivoId: 'OE-03',
    isLeading: true,
    frecuenciaMedicion: 'Diaria (por lote) y Mensual',
    capaDatos: 'Capa 2 · Datos Industriales Simulados Calibrados (Calidad AQAP-2110)',
    descripcionProposito:
      'Mide el porcentaje de unidades que completan la fabricación cumpliendo todas las tolerancias dimensionales, metalúrgicas y electrónicas en el primer intento, sin retrabajo ni descarte (scrap). Evita desperdicio de insumos críticos y pérdida de horas-hombre en líneas saturadas.',
    preguntaNegocio:
      '¿Qué proporción de nuestra producción sale libre de defectos desde la primera pasada sin consumir capacidad adicional en retrabajos?',
    justificacionEstrategica:
      'A diferencia de medir solo chatarra final, penaliza los retrabajos internos que consumen capacidad escasa y anticipa desviaciones antes de las pruebas balísticas finales.',
    indicadoresBase: [
      'Total de unidades inspeccionadas en línea',
      'Unidades conformes vs. rechazadas o enviadas a retrabajo',
    ],
    justificacionObtencion:
      'Generado a partir de un dataset simulado calibrado bajo tolerancias de defensa europea, reflejando inspecciones automatizadas por visión artificial, ultrasonido y rayos X en línea.',
    smart: {
      S: 'Piezas conformes sin reproceso en estaciones críticas',
      M: 'Porcentaje sobre inspeccionadas',
      A: 'Estándar industrial ≥ 97%',
      R: 'Protege márgenes e insumos críticos',
      T: 'Medición continua y mensual 2026',
    },
    metaTargetNumeric: 97.0,
  },
  'KPI-3.2': {
    sectorId: 'calidad',
    objetivoId: 'OE-03',
    isLeading: false,
    frecuenciaMedicion: 'Mensual y Trimestral',
    capaDatos: 'Capa 1 + 2 · Anclaje Público + Telemetría Calibrada (GQAR)',
    descripcionProposito:
      'Cuantifica el porcentaje de lotes terminados que son rechazados, observados o retenidos durante las auditorías finales y pruebas balísticas junto a los representantes gubernamentales de calidad (GQAR). Mitiga uno de los cuellos de botella operativos más sensibles de Rheinmetall en 2026.',
    preguntaNegocio:
      '¿Qué porcentaje de los lotes terminados sufre rechazos o demoras en las pruebas de aceptación del cliente, bloqueando su entrega y facturación?',
    justificacionEstrategica:
      'En contratos militares, un lote fabricado pero no aceptado por el inspector estatal no puede facturarse, inmovilizando millones de euros en inventario terminado.',
    indicadoresBase: [
      'Lotes rechazados o retenidos en inspección final (GQAR)',
      'Total de lotes presentados a aceptación gubernamental',
    ],
    justificacionObtencion:
      'Justificado directamente por los reportes trimestrales de Rheinmetall AG (2026) —que señalaron retenciones de lotes de 155 mm por demoras en pruebas de aceptación— y modelado mediante registros calibrados de polígonos de tiro.',
    smart: {
      S: 'Lotes retenidos en aceptación final',
      M: 'Porcentaje sobre lotes presentados',
      A: 'Meta ≤ 1,5% con pre-auditorías',
      R: 'Desbloquea facturación y flujo de caja',
      T: 'Corte mensual/trimestral 2026',
    },
    metaTargetNumeric: 1.5,
  },
  'KPI-4.1': {
    sectorId: 'compras',
    objetivoId: 'OE-04',
    isLeading: true,
    frecuenciaMedicion: 'Mensual y Trimestral',
    capaDatos: 'Capa 1 + 2 · Anclaje Público + Telemetría Calibrada (SAP MM)',
    descripcionProposito:
      'Indica la cantidad promedio de días que el inventario disponible de materias primas y componentes en proceso puede abastecer la manufactura al ritmo actual de consumo. Equilibra el riesgo de parada por desabastecimiento frente a la inmovilización excesiva de capital de trabajo.',
    preguntaNegocio:
      '¿Cuántos días de producción tenemos cubiertos con nuestro stock actual sin inmovilizar capital financiero en exceso?',
    justificacionEstrategica:
      'El valor monetario absoluto del stock sube naturalmente al crecer las ventas; medirlo en días de cobertura permite controlar la eficiencia del capital de trabajo (~€2.000M invertidos en inventarios en 2026).',
    indicadoresBase: [
      'Valor promedio del inventario operativo [€]',
      'Costo de materiales consumidos en el período [€]',
      'Días del período',
    ],
    justificacionObtencion:
      'Modelo Híbrido Calibrado anclado a los balances trimestrales reales de Rheinmetall AG (2025–2026) y tasas diarias de consumo de planta en SAP MM.',
    smart: {
      S: 'Cobertura temporal del inventario operativo',
      M: 'Días exactos',
      A: 'Banda 65–80 días acorde a ciclos de defensa',
      R: 'Optimiza flujo de caja libre y continuidad',
      T: 'Corte mensual 2026',
    },
    metaTargetNumeric: [65, 80],
  },
  'KPI-4.2': {
    sectorId: 'compras',
    objetivoId: 'OE-04',
    isLeading: false,
    frecuenciaMedicion: 'Mensual (alertas semanales)',
    capaDatos: 'Capa 2 · Datos Industriales Simulados Calibrados (Compras / SAP Ariba)',
    descripcionProposito:
      'Mide el porcentaje de órdenes de compra de materias primas críticas (aceros especiales, precursores químicos, nitrocelulosa, microelectrónica) entregadas simultáneamente en la fecha pactada (On-Time) y en la cantidad/especificación exacta (In-Full). Audita la resiliencia de la cadena Tier-1.',
    preguntaNegocio:
      '¿Están nuestros proveedores estratégicos entregando los insumos críticos en la fecha acordada y en las cantidades completas necesarias para sostener el ritmo fabril?',
    justificacionEstrategica:
      'Una entrega puntual pero incompleta detiene una línea de ensamblaje igual que un retraso; el OTIF exige ambas condiciones para fundamentar decisiones de homologación o penalización.',
    indicadoresBase: [
      'Órdenes de compra recibidas en fecha pactada y completas (On-Time In-Full)',
      'Total de órdenes programadas en el período',
    ],
    justificacionObtencion:
      'Generado mediante un dataset simulado calibrado según las tensiones de suministro químico y metalúrgico europeo en 2026, cruzando órdenes SAP MM contra remitos de almacén.',
    smart: {
      S: 'Cumplimiento integral de entregas críticas',
      M: 'Porcentaje de órdenes 100% conformes',
      A: 'Meta 94% con contratos marco',
      R: 'Evita paradas de línea de alto costo',
      T: 'Evaluación mensual 2026',
    },
    metaTargetNumeric: 94.0,
  },
  'KPI-5.1': {
    sectorId: 'seguridad',
    objetivoId: 'OE-05',
    isLeading: true,
    frecuenciaMedicion: 'Semanal y Mensual',
    capaDatos: 'Capa 2 · Datos Industriales Simulados Calibrados (Seguridad SAP EHS)',
    descripcionProposito:
      'Mide el porcentaje de condiciones inseguras, auditorías ATEX (atmósferas explosivas) y cuasi-accidentes (near-misses) mitigados y verificados dentro del plazo acordado (SLA). Impulsa la prevención activa antes de que ocurran lesiones personales o siniestros industriales.',
    preguntaNegocio:
      '¿Con qué eficacia y rapidez estamos eliminando los peligros operativos y cuasi-accidentes detectados en planta antes de que se conviertan en accidentes reales?',
    justificacionEstrategica:
      'En plantas que manipulan sustancias explosivas y propulsores, esperar al accidente es inaceptable; la velocidad de cierre preventivo es el principal predictor de seguridad futura.',
    indicadoresBase: [
      'Hallazgos de seguridad y cuasi-accidentes cerrados dentro del plazo SLA',
      'Total de hallazgos preventivos reportados',
    ],
    justificacionObtencion:
      'Modelado mediante un dataset simulado calibrado para plantas de manufactura pesada y energética, registrando inspecciones preventivas y reportes de operarios.',
    smart: {
      S: 'Resolución preventiva en plazo de hallazgos EHS',
      M: 'Porcentaje cerrado en SLA',
      A: 'Meta ≥ 95%',
      R: 'Previene siniestros en zonas ATEX',
      T: 'Corte semanal/mensual 2026',
    },
    metaTargetNumeric: 95.0,
  },
  'KPI-5.2': {
    sectorId: 'seguridad',
    objetivoId: 'OE-05',
    isLeading: false,
    frecuenciaMedicion: 'Mensual (reporte inmediato de incidentes)',
    capaDatos: 'Capa 1 + 2 · Anclaje Público ESG + Telemetría Calibrada (ISO 45001)',
    descripcionProposito:
      'Indicador internacional bajo norma ISO 45001 que cuantifica el número de accidentes laborales que provocan al menos un día completo de baja médica por cada millón de horas-hombre trabajadas. Audita la seguridad real ante la rápida incorporación de nuevo personal operativo.',
    preguntaNegocio:
      '¿Qué tan seguros son nuestros procesos industriales en relación con la exposición total de horas trabajadas por nuestra plantilla?',
    justificacionEstrategica:
      'Normalizar los accidentes por millón de horas permite comparar objetivamente plantas de distinto tamaño (Unterlüß, Kassel, Murcia) y auditar el cumplimiento ético y legal.',
    indicadoresBase: [
      'Número de accidentes laborales con baja médica (≥ 1 día perdido)',
      'Total de horas-hombre trabajadas',
    ],
    justificacionObtencion:
      'Modelo Híbrido Calibrado anclado a las divulgaciones no financieras (Reporte ESG) del Informe Anual de Rheinmetall AG y desagregado por planta operativa.',
    smart: {
      S: 'Accidentes con baja normalizados por exposición',
      M: 'Tasa por 10^6 horas',
      A: 'Benchmark industrial europeo ≤ 2,20',
      R: 'Protege integridad física y continuidad operativa',
      T: 'Acumulado mensual 2026',
    },
    metaTargetNumeric: 2.2,
  },
};

export const KPI_CATALOG: EnrichedKpiMeta[] = DATASET.catalogo_kpis.map((raw) => ({
  ...raw,
  ...ANNEX_ENRICHMENT[raw.codigo],
}));

export const KPI_META_BY_CODE: Record<KpiCode, EnrichedKpiMeta> = Object.fromEntries(
  KPI_CATALOG.map((k) => [k.codigo, k])
) as Record<KpiCode, EnrichedKpiMeta>;

export const CORPORATE_CONTEXT = {
  backlogFin2025: '€63.800M',
  backlogQ3_2026: '€78.000M',
  backlogPre2022: '€24.500M',
  municion155RampUp: '70.000 → >700.000 proyectiles/año',
  inventarioEstrategico2026: '~€2.000M',
  dotacion: '>31.000 colaboradores · >130 plantas',
  ventasFY25: '€9.935M',
  margenFY25: '18,5%',
};
