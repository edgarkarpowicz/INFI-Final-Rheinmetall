import { useState } from 'react';
import {
  ArrowRight,
  Database,
  Download,
  ExternalLink,
  GitBranch,
  Layers,
  Shield,
} from 'lucide-react';
import {
  CORPORATE_CONTEXT,
  DATASET,
  PRIMARY_SOURCES,
  SECTORS,
} from '../../data/kpiCatalogEnriched';
import { downloadCsv, formatNumberEs } from '../../utils/formatters';
import { getQuarterlyAndAnnualSummary } from '../../utils/kpiEngine';

type ExplorerTab = 'quarterly' | 'monthly' | 'divisional';

const HYBRID_PRINCIPLES = {
  principle:
    'Unimos cifras reales que Rheinmetall informa al mercado con datos de fábrica simulados y calibrados allí donde la operación interna es confidencial.',
  layers: [
    {
      title: 'Capa de Datos Corporativos Reales',
      level: 'Nivel Macro Financiero, Sostenibilidad y Seguridad',
      badge: 'Reales y Auditados',
      accent: 'green' as const,
      sources:
        'Reportes Financieros Anuales y Trimestrales oficiales de Rheinmetall AG (2025–2026) e Informe Corporativo de Sostenibilidad y Seguridad Laboral.',
      scope:
        'Ventas facturadas (€8.376M), nuevos pedidos (€19.100M), resultado operativo, cartera contratada (€78.000M), stock estratégico extra (~€2.000M), demoras en entregas y accidentabilidad base.',
      justification:
        'Garantiza fidelidad contable: el tablero refleja la escala real del negocio y cuadra con lo que la empresa reporta públicamente.',
      kpis: ['KPI-1.1', 'KPI-1.2', 'KPI-3.2 (ancla)', 'KPI-4.1 (ancla)', 'KPI-5.2 (ancla)'],
    },
    {
      title: 'Capa de Datos Industriales Simulados Calibrados',
      level: 'Nivel Planta, Calidad y Cadena de Abastecimiento',
      badge: 'Simulados Calibrados',
      accent: 'blue' as const,
      sources:
        'Normativa de calidad militar de la OTAN (AQAP-2110), ISO 45001 y estándares de manufactura europea, ajustados al crecimiento real de proyectiles de 155 mm (de 70.000 a >700.000 u/año).',
      scope:
        'El detalle mensual dentro de las fábricas: eficiencia real de máquinas (OEE), cumplimiento del plan maestro (MPS), piezas aprobadas sin reproceso (FPY), puntualidad de proveedores (OTIF) y cierre preventivo de riesgos.',
      justification:
        'Por seguridad nacional y secreto industrial, Rheinmetall no divulga telemetría interna de sus líneas ni entregas por proveedor; calibrar estas señales mantiene el realismo operativo.',
      kpis: ['KPI-2.1', 'KPI-2.2', 'KPI-3.1', 'KPI-4.2', 'KPI-5.1', 'Desglose mensual 3.2 / 4.1 / 5.2'],
    },
  ],
};

const ETL_FLOW_STEPS = [
  {
    step: '01',
    label: 'Sistemas y Documentos Origen',
    desc: 'Software corporativo, sensores de planta y registros oficiales',
  },
  {
    step: '02',
    label: 'Extracción, Transformación y Carga',
    desc: 'Recolección automática, limpieza y orden mensual',
  },
  {
    step: '03',
    label: 'Cálculo de Indicadores',
    desc: 'Fórmulas de negocio y semáforos de alerta',
  },
  {
    step: '04',
    label: 'Tablero Ejecutivo',
    desc: 'Visualización unificada para decidir por sector',
    accent: true,
  },
];

const ETL_PLATFORMS = [
  {
    sistema: 'SAP S/4HANA (Gestión Empresarial Corporativa)',
    software: 'SAP S/4HANA (Ventas, Materiales y Finanzas), Gestión de Almacenes (EWM) y portal de compras SAP Ariba.',
    alimenta: 'Sector 1 (Ventas) & Sector 4 (Compras y Abastecimiento)',
    resumen:
      'Registra toda la actividad comercial y administrativa del grupo: contratos adjudicados, facturación a gobiernos, márgenes operativos, compras a proveedores e inventarios valorizados.',
    documentos:
      'Contratos adjudicados, facturas a gobiernos, estados de resultados, órdenes de compra y stock valorizado.',
    kpis: 'Book-to-Bill (1.1), Margen Operativo (1.2), Días de Inventario (4.1) y Supplier OTIF (4.2).',
  },
  {
    sistema: 'Siemens Opcenter (Control y Ejecución de Planta)',
    software: 'Sistema MES Siemens Opcenter conectado a sensores de máquina (PLC/SCADA) y Planificación SAP PP.',
    alimenta: 'Sector 2 (Línea de Producción)',
    resumen:
      'Conecta en tiempo real las máquinas y líneas de montaje para medir disponibilidad, ritmo de producción, microparadas y volumen liberado frente al programa maestro.',
    documentos:
      'Partes digitales de turno (tiempo activo vs. plan), registro de microparadas, cambios de formato y órdenes cerradas.',
    kpis: 'Eficiencia Global de Equipos — OEE (2.1) y Cumplimiento del Programa Maestro — MPS (2.2).',
  },
  {
    sistema: 'Sistema de Calidad OTAN y Polígonos Balísticos',
    software: 'SAP Gestión de Calidad (QM), estaciones de inspección óptica, ultrasonido y rayos X (norma AQAP-2110) y polígonos de prueba.',
    alimenta: 'Sector 3 (Calidad)',
    resumen:
      'Centraliza las inspecciones automáticas en línea para evitar reprocesos y documenta las pruebas balísticas oficiales exigidas antes de certificar y entregar cada lote.',
    documentos:
      'Reportes de piezas conformes al primer intento (FPY), fichas de reproceso y actas oficiales de aceptación estatal GQAR.',
    kpis: 'First-Pass Yield — FPY (3.1) y Tasa de Rechazo o Demora de Lotes (3.2).',
  },
  {
    sistema: 'SAP Gestión de Seguridad, Salud y Personal',
    software: 'SAP Seguridad Industrial y Salud (EHS) integrado con gestión de turnos y personal (SAP SuccessFactors, norma ISO 45001).',
    alimenta: 'Sector 5 (Seguridad EHS)',
    resumen:
      'Monitorea hallazgos y riesgos preventivos en zonas con material energético a tres turnos, cruzando los partes médicos de accidentes con las horas-hombre reales trabajadas.',
    documentos:
      'Checklists en zonas con riesgo explosivo (ATEX), cierres de hallazgos en SLA, registro de horas-hombre y partes médicos de baja.',
    kpis: 'Cierre Proactivo de Riesgos (5.1) e Índice de Frecuencia de Accidentes — LTIFR (5.2).',
  },
];

export function MethodologyView() {
  const [tab, setTab] = useState<ExplorerTab>('quarterly');
  const quarterlyRows = getQuarterlyAndAnnualSummary();

  const handleExportCsv = () => {
    if (tab === 'quarterly') {
      downloadCsv(
        'rheinmetall_2026_consolidado_trimestral_anual.csv',
        [
          'Periodo',
          'Clasificacion',
          'Ventas_MEUR',
          'Pedidos_MEUR',
          'BtB',
          'EBIT_MEUR',
          'Margen_pct',
          'OEE_pct',
          'MPS_pct',
          'FPY_pct',
          'Rechazo_GQAR_pct',
          'DOS_dias',
          'OTIF_pct',
          'Cierre_EHS_pct',
          'LTIFR',
        ],
        quarterlyRows.map((r) => [
          r.periodo,
          r.clasificacion,
          r.ventas,
          r.pedidos,
          r.btb,
          r.ebit,
          r.margen,
          r.oee,
          r.mps,
          r.fpy,
          r.rechazo,
          r.dos,
          r.otif,
          r.ehs,
          r.ltifr,
        ])
      );
      return;
    }

    if (tab === 'monthly') {
      downloadCsv(
        'rheinmetall_2026_serie_mensual.csv',
        [
          'ID',
          'Mes',
          'Trimestre',
          'Tipo_Dato',
          'Ventas_MEUR',
          'Pedidos_MEUR',
          'EBIT_MEUR',
          'KPI_1_1_BtB',
          'KPI_1_2_Margen',
          'KPI_2_1_OEE',
          'KPI_2_2_MPS',
          'KPI_3_1_FPY',
          'KPI_3_2_Rechazo',
          'KPI_4_1_DOS',
          'KPI_4_2_OTIF',
          'KPI_5_1_EHS',
          'KPI_5_2_LTIFR',
        ],
        DATASET.serie_mensual_2026.map((m) => [
          m.id,
          m.mes,
          m.trimestre,
          m.tipo_dato,
          m.ventas,
          m.pedidos,
          m.ebit,
          m.kpi_1_1_btb,
          m.kpi_1_2_margen,
          m.kpi_2_1_oee,
          m.kpi_2_2_mps,
          m.kpi_3_1_fpy,
          m.kpi_3_2_rechazo,
          m.kpi_4_1_dos,
          m.kpi_4_2_otif,
          m.kpi_5_1_ehs,
          m.kpi_5_2_ltifr,
        ])
      );
      return;
    }

    downloadCsv(
      'rheinmetall_2026_desglose_divisional.csv',
      [
        'Division',
        'Planta',
        'Trimestre',
        'Origen',
        'Ventas_MEUR',
        'Pedidos_MEUR',
        'BtB',
        'Margen_pct',
        'OEE_pct',
        'MPS_pct',
        'FPY_pct',
        'Rechazo_pct',
        'DOS_dias',
        'OTIF_pct',
        'Cierre_EHS_pct',
        'LTIFR',
      ],
      DATASET.desglose_divisional_2026.map((d) => [
        d.division,
        d.planta,
        d.trimestre,
        d.origen,
        d.ventas_meur,
        d.pedidos_meur,
        d.btb,
        d.margen_pct,
        d.oee_pct,
        d.mps_pct,
        d.fpy_pct,
        d.rechazo_lotes_pct,
        d.dos_dias,
        d.otif_pct,
        d.cierre_ehs_pct,
        d.ltifr,
      ])
    );
  };

  return (
    <div className="space-y-6">
      {/* Closed Management Loop & Zeitenwende Context */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rhm-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
            <GitBranch className="h-4 w-4" />
            Marco Conceptual · Ciclo Cerrado de Gestión
          </div>
          <h3 className="font-display mt-1 text-lg font-bold text-[var(--text-primary)]">
            Ciclo Cerrado de Gestión: KPI = Objetivo + Métrica + Meta + Decisión
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            {['1. Objetivos', '2. Indicadores (KPI)', '3. Medición', '4. Análisis', '5. Decisión'].map(
              (step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className="rounded px-2.5 py-1"
                    style={{
                      backgroundColor: 'var(--accent-blue-soft)',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    {step}
                  </span>
                  {idx < 4 && (
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--accent-blue)' }} />
                  )}
                </div>
              )
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            Ningún dato se observa de forma aislada: cada KPI responde a una pregunta crítica de negocio, distingue indicadores operativos de KPIs estratégicos, equilibra métricas <em>Leading</em> y <em>Lagging</em>, y dispara protocolos obligatorios ante cualquier desvío.
          </p>
        </div>

        <div className="rhm-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
            <Shield className="h-4 w-4" />
            Contexto Estratégico · Zeitenwende
          </div>
          <h3 className="font-display mt-1 text-lg font-bold text-[var(--text-primary)]">
            Rheinmetall AG — De Vender a Producir a Escala Industrial
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5">
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Expansión Backlog (9M 2026)</div>
              <div className="font-mono-num font-bold text-[var(--text-primary)]">
                {CORPORATE_CONTEXT.backlogPre2022} → {CORPORATE_CONTEXT.backlogQ3_2026}
              </div>
            </div>
            <div className="rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5">
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Ramp-Up 155 mm</div>
              <div className="font-mono-num font-bold text-[var(--text-primary)]">
                {CORPORATE_CONTEXT.municion155RampUp}
              </div>
            </div>
            <div className="rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5">
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Stock Estratégico 2026</div>
              <div className="font-mono-num font-bold text-[var(--text-primary)]">
                {CORPORATE_CONTEXT.inventarioEstrategico2026} capital de trabajo
              </div>
            </div>
            <div className="rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5">
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Escala Global</div>
              <div className="font-mono-num font-bold text-[var(--text-primary)]">
                {CORPORATE_CONTEXT.dotacion}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2-Layer Complementary Hybrid Data Model */}
      <section className="rhm-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
            <Layers className="h-4 w-4" />
            Transparencia Metodológica — Arquitectura Híbrida (2 Capas Complementarias)
          </div>
          <span
            className="rounded px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' }}
          >
            Fidelidad financiera + realismo de planta
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {HYBRID_PRINCIPLES.principle}
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {HYBRID_PRINCIPLES.layers.map((layer) => (
            <div
              key={layer.title}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4 text-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {layer.level}
                  </div>
                  <h4 className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{layer.title}</h4>
                </div>
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-semibold"
                  style={
                    layer.accent === 'green'
                      ? {
                          backgroundColor: 'var(--status-green-bg)',
                          color: 'var(--status-green-text)',
                        }
                      : {
                          backgroundColor: 'var(--accent-blue-soft)',
                          color: 'var(--accent-blue)',
                        }
                  }
                >
                  {layer.badge}
                </span>
              </div>
              <dl className="mt-3 space-y-2 text-[var(--text-secondary)]">
                <div>
                  <dt className="font-semibold text-[var(--text-primary)]">De dónde sale:</dt>
                  <dd>{layer.sources}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--text-primary)]">Qué aporta:</dt>
                  <dd>{layer.scope}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--text-primary)]">Por qué se usa:</dt>
                  <dd>{layer.justification}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {layer.kpis.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono-num text-[10px] text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Nota de Reconciliación Contable (9M y FY 2026):</strong>{' '}
          La suma de Enero–Septiembre 2026 arroja exactamente <strong>€8.376,00M</strong> en Ventas,{' '}
          <strong>€19.100,00M</strong> en Pedidos (Book-to-Bill = <strong>2,28x</strong>) y{' '}
          <strong>€1.340,16M</strong> en EBIT (Margen = <strong>16,00%</strong>; Rheinmetall reporta €1.339M, diferencia de redondeo del margen). Los trimestres Q1–Q3 son una desagregación calibrada: no replican los Quarterly Statements individuales, pero su suma cuadra con el acumulado 9M auditado. El cierre Q4 es una proyección propia conservadora (FY €12.800M · 18,10%), por debajo del guidance ajustado del 05/11/2026 (~€13.200M · ~18,5%). Para consolidaciones trimestrales y anuales de OEE y DOS, el motor sigue exactamente las fórmulas de la hoja <code>3_Trimestral_y_Anual_2026</code> del libro Excel (OEE FY = 80,92%; DOS FY = 80,3 d promedio mensual, frente a 81,23% y 79,9 d en cálculo agregado anual de la hoja 2).
        </div>
      </section>

      {/* ETL Pipeline & Traceability Matrix */}
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rhm-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
            <Database className="h-4 w-4" />
            Integración en Vivo · Pipeline ETL del Piso de Fábrica al Tablero
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ETL_FLOW_STEPS.map((st) => (
              <div
                key={st.step}
                className="rounded-lg border p-2.5 text-[11px]"
                style={
                  st.accent
                    ? {
                        backgroundColor: 'var(--accent-blue-soft)',
                        borderColor: 'var(--accent-blue)',
                      }
                    : {
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-color)',
                      }
                }
              >
                <div className="font-mono-num text-[10px] font-bold text-[var(--accent-blue)]">
                  {st.step}
                </div>
                <div className="font-semibold text-[var(--text-primary)]">{st.label}</div>
                <div className="mt-0.5 text-[10px] leading-snug text-[var(--text-secondary)]">
                  {st.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-3">
            {ETL_PLATFORMS.map((p) => (
              <div
                key={p.sistema}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[var(--text-primary)]">{p.sistema}</span>
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'var(--accent-blue-soft)',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    {p.alimenta}
                  </span>
                </div>
                <p className="mt-1.5 text-[var(--text-secondary)]">{p.resumen}</p>
                <div className="mt-2 space-y-1 border-t pt-2 text-[11px] text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <strong className="text-[var(--text-primary)]">Software y áreas:</strong> {p.software}
                  </div>
                  <div>
                    <strong className="text-[var(--text-primary)]">Documentos reales:</strong> {p.documentos}
                  </div>
                  <div>
                    <strong className="text-[var(--accent-blue)]">KPIs que alimenta:</strong> {p.kpis}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rhm-card rounded-xl p-5">
          <h3 className="font-display text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
            Matriz de Trazabilidad y Fuentes Primarias (SRC-01 a SRC-06)
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b text-[10px] uppercase text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <th className="py-2 pr-2">Sector</th>
                  <th className="py-2 pr-2">KPIs (Leading / Lagging)</th>
                  <th className="py-2">Decisor</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {SECTORS.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 pr-2 font-semibold text-[var(--text-primary)]">
                      {s.numero}. {s.nombre}
                    </td>
                    <td className="py-2 pr-2 font-mono-num text-[11px] text-[var(--text-secondary)]">
                      {s.leadingCode} / {s.laggingCode}
                    </td>
                    <td className="py-2 text-[var(--text-secondary)]">{s.decisorPrincipal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Enlaces Oficiales Verificables
            </div>
            {PRIMARY_SOURCES.map((src) => (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-2 rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2 text-xs transition hover:border-[var(--border-strong)]"
              >
                <div>
                  <span
                    className="font-mono-num font-bold"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    {src.id}
                  </span>{' '}
                  <span className="font-semibold text-[var(--text-primary)]">{src.documento}</span>
                  <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{src.uso}</p>
                </div>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-blue)]" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Raw Dataset Explorer + CSV Export */}
      <section className="rhm-card overflow-hidden rounded-xl">
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['quarterly', 'Resumen Trimestral & Anual'],
                ['monthly', 'Serie Mensual (12 meses)'],
                ['divisional', 'Desglose Divisional (12 reg.)'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="cursor-pointer rounded border px-3 py-1.5 text-xs font-medium transition"
                style={
                  tab === id
                    ? {
                        backgroundColor: 'var(--accent-blue-soft)',
                        borderColor: 'var(--accent-blue)',
                        color: 'var(--accent-blue)',
                        fontWeight: 600,
                      }
                    : {
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-secondary)',
                      }
                }
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded bg-[#1D5B8C] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#164770]"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          {tab === 'quarterly' && (
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="border-b bg-[var(--bg-elevated)] text-[11px] uppercase text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <th className="px-3 py-2.5">Período</th>
                  <th className="px-3 py-2.5">Clasificación</th>
                  <th className="px-3 py-2.5 text-right">Ventas</th>
                  <th className="px-3 py-2.5 text-right">Pedidos</th>
                  <th className="px-3 py-2.5 text-right">BtB</th>
                  <th className="px-3 py-2.5 text-right">EBIT</th>
                  <th className="px-3 py-2.5 text-right">Margen</th>
                  <th className="px-3 py-2.5 text-right">OEE</th>
                  <th className="px-3 py-2.5 text-right">MPS</th>
                  <th className="px-3 py-2.5 text-right">FPY</th>
                  <th className="px-3 py-2.5 text-right">GQAR</th>
                  <th className="px-3 py-2.5 text-right">DOS</th>
                  <th className="px-3 py-2.5 text-right">OTIF</th>
                  <th className="px-3 py-2.5 text-right">EHS</th>
                  <th className="px-3 py-2.5 text-right">LTIFR</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono-num" style={{ borderColor: 'var(--border-color)' }}>
                {quarterlyRows.map((r) => (
                  <tr key={r.periodo} className="hover:bg-[var(--bg-elevated)]">
                    <td className="px-3 py-2 font-sans font-bold text-[var(--text-primary)]">{r.periodo}</td>
                    <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">{r.clasificacion}</td>
                    <td className="px-3 py-2 text-right">€{formatNumberEs(r.ventas, 0)}M</td>
                    <td className="px-3 py-2 text-right">€{formatNumberEs(r.pedidos, 0)}M</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.btb, 2)}x</td>
                    <td className="px-3 py-2 text-right">€{formatNumberEs(r.ebit, 2)}M</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.margen, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.oee, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.mps, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.fpy, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.rechazo, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.dos, 1)} d</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.otif, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.ehs, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(r.ltifr, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'monthly' && (
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="border-b bg-[var(--bg-elevated)] text-[11px] uppercase text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <th className="px-3 py-2.5">Mes</th>
                  <th className="px-3 py-2.5">Origen</th>
                  <th className="px-3 py-2.5 text-right">Ventas</th>
                  <th className="px-3 py-2.5 text-right">Pedidos</th>
                  <th className="px-3 py-2.5 text-right">BtB</th>
                  <th className="px-3 py-2.5 text-right">Margen</th>
                  <th className="px-3 py-2.5 text-right">OEE</th>
                  <th className="px-3 py-2.5 text-right">MPS</th>
                  <th className="px-3 py-2.5 text-right">FPY</th>
                  <th className="px-3 py-2.5 text-right">GQAR</th>
                  <th className="px-3 py-2.5 text-right">DOS</th>
                  <th className="px-3 py-2.5 text-right">OTIF</th>
                  <th className="px-3 py-2.5 text-right">EHS</th>
                  <th className="px-3 py-2.5 text-right">LTIFR</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono-num" style={{ borderColor: 'var(--border-color)' }}>
                {DATASET.serie_mensual_2026.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--bg-elevated)]">
                    <td className="px-3 py-2 font-sans font-bold text-[var(--text-primary)]">{m.mes}</td>
                    <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">{m.tipo_dato}</td>
                    <td className="px-3 py-2 text-right">€{formatNumberEs(m.ventas, 0)}M</td>
                    <td className="px-3 py-2 text-right">€{formatNumberEs(m.pedidos, 0)}M</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_1_1_btb, 2)}x</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_1_2_margen, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_2_1_oee, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_2_2_mps, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_3_1_fpy, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_3_2_rechazo, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_4_1_dos, 1)} d</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_4_2_otif, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_5_1_ehs, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(m.kpi_5_2_ltifr, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'divisional' && (
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="border-b bg-[var(--bg-elevated)] text-[11px] uppercase text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <th className="px-3 py-2.5">División</th>
                  <th className="px-3 py-2.5">Planta</th>
                  <th className="px-3 py-2.5">Trim.</th>
                  <th className="px-3 py-2.5 text-right">Ventas</th>
                  <th className="px-3 py-2.5 text-right">Pedidos</th>
                  <th className="px-3 py-2.5 text-right">BtB</th>
                  <th className="px-3 py-2.5 text-right">Margen</th>
                  <th className="px-3 py-2.5 text-right">OEE</th>
                  <th className="px-3 py-2.5 text-right">MPS</th>
                  <th className="px-3 py-2.5 text-right">FPY</th>
                  <th className="px-3 py-2.5 text-right">GQAR</th>
                  <th className="px-3 py-2.5 text-right">DOS</th>
                  <th className="px-3 py-2.5 text-right">OTIF</th>
                  <th className="px-3 py-2.5 text-right">EHS</th>
                  <th className="px-3 py-2.5 text-right">LTIFR</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono-num" style={{ borderColor: 'var(--border-color)' }}>
                {DATASET.desglose_divisional_2026.map((d) => (
                  <tr key={`${d.division}-${d.trimestre}`} className="hover:bg-[var(--bg-elevated)]">
                    <td className="px-3 py-2 font-sans font-bold text-[var(--text-primary)]">{d.division}</td>
                    <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">{d.planta}</td>
                    <td className="px-3 py-2">{d.trimestre}</td>
                    <td className="px-3 py-2 text-right">€{formatNumberEs(d.ventas_meur, 0)}M</td>
                    <td className="px-3 py-2 text-right">€{formatNumberEs(d.pedidos_meur, 0)}M</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.btb, 2)}x</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.margen_pct, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.oee_pct, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.mps_pct, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.fpy_pct, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.rechazo_lotes_pct, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.dos_dias, 1)} d</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.otif_pct, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.cierre_ehs_pct, 2)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumberEs(d.ltifr, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
