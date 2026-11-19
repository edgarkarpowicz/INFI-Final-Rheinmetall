import type { KpiMomentum, KpiStatus } from '../../types/kpi';

export function getMomentumDisplay(momentum: KpiMomentum): {
  arrow: string;
  color: string;
  label: string;
} {
  const arrow =
    momentum.direction === 'improving'
      ? '↗'
      : momentum.direction === 'worsening'
        ? '↘'
        : '→';
  const color =
    momentum.direction === 'improving'
      ? 'var(--status-green-text)'
      : momentum.direction === 'worsening'
        ? 'var(--status-red-text)'
        : 'var(--text-muted)';
  return {
    arrow,
    color,
    label: `${arrow} ${momentum.deltaText} ${momentum.comparisonLabel}`,
  };
}

export function getStatusVars(status: KpiStatus) {
  if (status === 'Óptimo') {
    return {
      color: 'var(--status-green)',
      text: 'var(--status-green-text)',
      bg: 'var(--status-green-bg)',
      border: 'var(--status-green-border)',
      label: 'Óptimo',
    };
  }
  if (status === 'Preventivo') {
    return {
      color: 'var(--status-yellow)',
      text: 'var(--status-yellow-text)',
      bg: 'var(--status-yellow-bg)',
      border: 'var(--status-yellow-border)',
      label: 'Preventivo',
    };
  }
  return {
    color: 'var(--status-red)',
    text: 'var(--status-red-text)',
    bg: 'var(--status-red-bg)',
    border: 'var(--status-red-border)',
    label: 'Crítico',
  };
}

export function StatusBadge({ status, size = 'sm' }: { status: KpiStatus; size?: 'sm' | 'md' }) {
  const v = getStatusVars(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === 'md' ? 'px-2.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      style={{
        backgroundColor: v.bg,
        color: v.text,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: v.color }} />
      {v.label}
    </span>
  );
}

export function TypologyBadge({ isLeading }: { isLeading: boolean }) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-medium"
      style={{
        color: isLeading ? 'var(--accent-blue)' : 'var(--text-muted)',
      }}
    >
      {isLeading ? 'Leading' : 'Lagging'}
    </span>
  );
}
