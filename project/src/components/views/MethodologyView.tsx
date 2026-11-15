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

const ETL_PLATFORMS = [
  {
    sistema: 'ERP Corporativo (SAP S/4HANA)',
    modulos: 'Módulos SD, MM, FI/CO · SAP EWM · SAP Ariba',
    alimenta: 'Sector 1 (Ventas) & Sector 4 (Compras y Abastecimiento)',
    datos: 'Facturación, Rheinmetall Nomination, EBIT, órdenes de compra, valoración de stock e inventario.',
  },
  {
    sistema: 'MES (Siemens Opcenter / PLC / SCADA)',
    modulos: 'Captura automatizada en piso de planta + SAP PP',
    alimenta: 'Sector 2 (Línea de Producción)',
    datos: 'Horas planificadas vs. reales, microparadas, setup, ciclo ideal (1,80 min/u) y cumplimiento MPS.',
  },
  {
    sistema: 'QMS — Norma OTAN AQAP-2110',
    modulos: 'SAP QM · Ensayos No Destructivos · Polígonos Balísticos',
    alimenta: 'Sector 3 (Calidad)',
    datos: 'Inspecciones dimensionales/ultrasonido/rayos X (FPY) y actas de aceptación estatal GQAR.',
  },
  {
    sistema: 'EHS Platform (SAP EHS Management)',
    modulos: 'SAP EHS + Control Horario SAP SuccessFactors',
    alimenta: 'Sector 5 (Seguridad EHS)',
    datos: 'Auditorías ATEX, hallazgos preventivos en SLA, horas-hombre trabajadas y accidentes ISO 45001.',
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
            Marco Conceptual (SRS §1.2 & Anexo §1.2)
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
            Contexto Estratégico Zeitenwende (SRS §2–3)
          </div>
          <h3 className="font-display mt-1 text-lg font-bold text-[var(--text-primary)]">
            Rheinmetall AG — De Vender a Producir a Escala Industrial
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5">
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Expansión Backlog</div>
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

      {/* 3-Layer Hybrid Data Model (1_Fuentes_y_Metodologia) */}
      <section className="rhm-card rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
          <Layers className="h-4 w-4" />
          Transparencia Metodológica — Arquitectura de Modelo Híbrido (3 Capas)
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {DATASET.fuentes_y_metodologia.map((layer) => (
            <div
              key={layer.capa}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4 text-xs"
            >
              <h4 className="font-bold text-[var(--text-primary)]">{layer.capa}</h4>
              <p className="mt-1 font-semibold text-[var(--accent-blue)]">{layer.alcance}</p>
              <div className="mt-2.5 space-y-2 text-[var(--text-secondary)]">
                <p>
                  <strong className="text-[var(--text-primary)]">Fuente oficial:</strong> {layer.fuente_oficial}
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">Anclajes reales:</strong> {layer.valores_reales_verificables}
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">Frontera sintética:</strong> {layer.donde_inicia_sintetico}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Nota de Reconciliación Contable (9M y FY 2026):</strong>{' '}
          La suma de Enero–Septiembre 2026 arroja exactamente <strong>€8.376,00M</strong> en Ventas,{' '}
          <strong>€19.100,00M</strong> en Pedidos (Book-to-Bill = <strong>2,28x</strong>) y{' '}
          <strong>€1.340,16M</strong> en EBIT (Margen = <strong>16,00%</strong>). Para consolidaciones trimestrales y anuales de OEE y DOS, el motor sigue exactamente las fórmulas de la hoja <code>3_Trimestral_y_Anual_2026</code> del libro Excel (OEE FY = 80,92%; DOS FY = 80,3 d promedio mensual, frente a 81,23% y 79,9 d en cálculo agregado anual de la hoja 2).
        </div>
      </section>

      {/* ETL Pipeline & Traceability Matrix (SRS Sec. 6.2 & Sec. 8) */}
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rhm-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
            <Database className="h-4 w-4" />
            Pipeline ETL y Sistemas Origen (SRS §6.2)
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
                <div className="mt-1 font-mono-num text-[11px] text-[var(--accent-blue)]">{p.modulos}</div>
                <p className="mt-1 text-[var(--text-secondary)]">{p.datos}</p>
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
