import type { KpiCode } from '../types/kpi';

export function formatNumberEs(value: number, decimals = 2): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = value < 0 && Number(fixed) > 0 ? '-' : '';
  return decPart !== undefined ? `${sign}${grouped},${decPart}` : `${sign}${grouped}`;
}

export function formatIntEs(value: number): string {
  return formatNumberEs(Math.round(value), 0);
}

export function formatKpiValue(code: KpiCode, value: number): string {
  switch (code) {
    case 'KPI-1.1':
      return `${formatNumberEs(value, 2)}x`;
    case 'KPI-4.1':
      return `${formatNumberEs(value, 1)} d`;
    case 'KPI-5.2':
      return `${formatNumberEs(value, 2)}`;
    default:
      return `${formatNumberEs(value, 2)}%`;
  }
}

export function formatCurrencyMeur(value: number, decimals = 1): string {
  return `€${formatNumberEs(value, decimals)}M`;
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>): void {
  const escape = (cell: string | number) => {
    const str = String(cell);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const csvContent = [
    headers.map(escape).join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
