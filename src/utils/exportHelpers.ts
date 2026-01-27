import { ProviderWeekData } from '../types';

export function exportToCSV(data: ProviderWeekData[], filename: string = 'provider-analytics.csv'): void {
  const headers = ['Provider', 'Week', 'Total Visits', 'Visits Over 20 Min', '% Over 20 Min', 'Avg Duration', 'Hours on 20+ Min'];
  
  const csvRows = [
    headers.join(','),
    ...data.map(row => [
      `"${row.provider}"`,
      `"${row.week}"`,
      row.totalVisits,
      row.visitsOver20Min,
      row.percentOver20Min.toFixed(2),
      row.avgDuration.toFixed(2),
      row.hoursOn20PlusMin?.toFixed(2) || '',
    ].join(','))
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

