import { useEffect } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Clock,
  Database,
  HelpCircle,
  ShieldCheck,
  Target,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { SECTOR_BY_ID } from '../../data/kpiCatalogEnriched';
import type { EvaluatedKpi } from '../../types/kpi';
import { getStatusVars, StatusBadge, TypologyBadge } from './StatusBadge';

interface KpiDetailModalProps {
  kpi: EvaluatedKpi | null;
  periodLabel: string;
  divisionLabel: string;
  onClose: () => void;
}

export function KpiDetailModal({ kpi, periodLabel, divisionLabel, onClose }: KpiDetailModalProps) {
  useEffect(() => {
    if (!kpi) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [kpi, onClose]);

  if (!kpi) return null;

  const sector = SECTOR_BY_ID[kpi.meta.sectorId];
  const sv = getStatusVars(kpi.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-xs sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kpi-modal-title"
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Calm Top Modal Header */}
        <div
          className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-5 py-4"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded px-2 py-0.5 font-mono-num text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent-blue-soft)',
                  color: 'var(--accent-blue)',
                }}
              >
                {kpi.meta.codigo}
              </span>
              <TypologyBadge isLeading={kpi.meta.isLeading} />
              <StatusBadge status={kpi.status} size="md" />
            </div>
            <h2
              id="kpi-modal-title"
              className="font-display mt-2 text-xl font-semibold text-[var(--text-primary)] sm:text-2xl"
            >
              {kpi.meta.nombre}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {kpi.meta.sector} · {sector.objetivoId} · Contexto: {divisionLabel} — {periodLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-1.5 text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            aria-label="Cerrar ficha técnica"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Current Measurement vs SMART Meta + Live Base Inputs */}
          <div className="grid gap-4 md:grid-cols-3">
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: sv.border,
              }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Medición del Período
              </div>
              <div className="font-mono-num mt-1 text-3xl font-bold text-[var(--text-primary)]">
                {kpi.formattedValue}
              </div>
              <div className="mt-1 text-xs font-semibold" style={{ color: sv.text }}>
                Meta SMART: {kpi.meta.meta} ({kpi.compliancePct.toFixed(1)}% cumpl.)
              </div>
              <div className="mt-1 font-mono-num text-[11px] text-[var(--text-secondary)]">
                {kpi.deltaLabel}
              </div>
            </div>

            <div
              className="rounded-lg border p-4 md:col-span-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <Calculator className="h-3.5 w-3.5 text-[#007EC1]" />
                Fórmula Matemática & Variables Base ({periodLabel})
              </div>
              <div className="font-mono-num mt-2 rounded border border-[var(--border-color)] bg-[var(--bg-canvas)] px-3 py-2 text-xs font-semibold text-[var(--accent-blue)]">
                {kpi.meta.formula}
              </div>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {kpi.baseInputs.map((inp) => (
                  <div
                    key={inp.label}
                    className="flex items-center justify-between rounded border border-[var(--border-color)] px-2.5 py-1.5 text-xs"
                  >
                    <span className="text-[var(--text-secondary)]">{inp.label}:</span>
                    <span className="font-mono-num font-bold text-[var(--text-primary)]">{inp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Protocolo de Decisión (RF-04) */}
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: kpi.protocolTriggered ? sv.bg : 'var(--bg-elevated)',
              borderColor: kpi.protocolTriggered ? sv.border : 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              {kpi.protocolTriggered ? (
                <>
                  <AlertTriangle className="h-4 w-4" style={{ color: sv.text }} />
                  <span style={{ color: sv.text }}>
                    Protocolo de Decisión y Acción Correctiva (RF-04 — ACTIVO)
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-green-text)]" />
                  <span className="text-[var(--status-green-text)]">
                    Protocolo de Decisión y Acción Correctiva (En Rango Óptimo)
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">{kpi.meta.protocolo}</p>
            {kpi.advisoryNote && (
              <p
                className="mt-2 rounded border px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                Diagnóstico automático: {kpi.advisoryNote}
              </p>
            )}
          </div>

          {/* Metadata Audit Grid (RF-05) */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <User className="h-3.5 w-3.5 text-[#007EC1]" />
                Responsable
              </div>
              <div className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                {kpi.meta.responsable}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Clock className="h-3.5 w-3.5 text-[#007EC1]" />
                Frecuencia de Medición
              </div>
              <div className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                {kpi.meta.frecuenciaMedicion}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Wrench className="h-3.5 w-3.5 text-[#007EC1]" />
                Herramienta / ETL
              </div>
              <div className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                {kpi.meta.herramienta}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Database className="h-3.5 w-3.5 text-[#007EC1]" />
                Capa de Datos
              </div>
              <div className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                {kpi.meta.capaDatos}
              </div>
            </div>
          </div>

          {/* Description, Business Question & Justification */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
                <Target className="h-4 w-4" />
                Descripción y Propósito Estratégico
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                {kpi.meta.descripcionProposito}
              </p>
              <div className="mt-3 text-xs font-semibold text-[var(--text-primary)]">
                Justificación como KPI Estratégico:
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                {kpi.meta.justificacionEstrategica}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
                <HelpCircle className="h-4 w-4" />
                Pregunta de Negocio y Metodología del Dato
              </div>
              <blockquote className="mt-2 border-l-2 border-[#007EC1] pl-3 text-xs italic text-[var(--text-primary)]">
                “{kpi.meta.preguntaNegocio}”
              </blockquote>
              <div className="mt-3 text-xs font-semibold text-[var(--text-primary)]">
                Justificación y Obtención del Dato:
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                {kpi.meta.justificacionObtencion}
              </p>
            </div>
          </div>

          {/* Traffic Light Thresholds Table + SMART Validation */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Umbrales Semafóricos (Anexo RHM-UBP-ANX-2026-02)
              </div>
              <div className="mt-2.5 space-y-2 text-xs">
                <div
                  className={`flex items-center justify-between rounded border px-3 py-2 ${
                    kpi.status === 'Óptimo' ? 'ring-1 ring-[var(--status-green)]' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--status-green-bg)',
                    borderColor: 'var(--status-green-border)',
                    color: 'var(--status-green-text)',
                  }}
                >
                  <span className="font-bold">Verde / Óptimo</span>
                  <span className="font-mono-num font-bold">{kpi.meta.verde}</span>
                </div>
                <div
                  className={`flex items-center justify-between rounded border px-3 py-2 ${
                    kpi.status === 'Preventivo' ? 'ring-1 ring-[var(--status-yellow)]' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--status-yellow-bg)',
                    borderColor: 'var(--status-yellow-border)',
                    color: 'var(--status-yellow-text)',
                  }}
                >
                  <span className="font-bold">Amarillo / Preventivo</span>
                  <span className="font-mono-num font-bold">{kpi.meta.amarillo}</span>
                </div>
                <div
                  className={`flex items-center justify-between rounded border px-3 py-2 ${
                    kpi.status === 'Crítico' ? 'ring-1 ring-[var(--status-red)]' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--status-red-bg)',
                    borderColor: 'var(--status-red-border)',
                    color: 'var(--status-red-text)',
                  }}
                >
                  <span className="font-bold">Rojo / Crítico</span>
                  <span className="font-mono-num font-bold">{kpi.meta.rojo}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                <ShieldCheck className="h-4 w-4 text-[#007EC1]" />
                Validación Criterios SMART
              </div>
              <dl className="mt-2.5 space-y-1.5 text-xs">
                {(
                  [
                    ['S · Específico', kpi.meta.smart.S],
                    ['M · Medible', kpi.meta.smart.M],
                    ['A · Alcanzable', kpi.meta.smart.A],
                    ['R · Relevante', kpi.meta.smart.R],
                    ['T · Temporal', kpi.meta.smart.T],
                  ] as const
                ).map(([label, desc]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="w-28 shrink-0 font-bold text-[var(--accent-blue)]">{label}:</dt>
                    <dd className="text-[var(--text-secondary)]">{desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
