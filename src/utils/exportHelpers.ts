import { ProviderWeekData } from '../types';

export function exportToCSV(data: ProviderWeekData[], filename: string = 'provider-data.csv') {
  const headers = ['Provider', 'Week', 'Total Visits', 'Visits Over 20 Min', '% Over 20 Min'];
  const rows = data.map(item => [
    item.provider,
    item.week,
    item.totalVisits.toString(),
    item.visitsOver20Min.toString(),
    item.percentOver20Min.toFixed(1),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

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

export function exportToPDF(data: ProviderWeekData[], summaryStats: any) {
  // For PDF export, we'll use a library like jsPDF or html2pdf
  // This is a simplified version that creates a printable HTML page
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Provider Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4f46e5; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .summary { margin-bottom: 20px; }
          .summary-item { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Provider Analytics Report</h1>
        <div class="summary">
          <div class="summary-item"><strong>Total Providers:</strong> ${summaryStats.totalProviders}</div>
          <div class="summary-item"><strong>Total Visits:</strong> ${summaryStats.totalVisits.toLocaleString()}</div>
          <div class="summary-item"><strong>Avg % Over 20 Min:</strong> ${summaryStats.avgPercentOver20Min.toFixed(1)}%</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Week</th>
              <th>Total Visits</th>
              <th>Visits Over 20 Min</th>
              <th>% Over 20 Min</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.provider}</td>
                <td>${item.week}</td>
                <td>${item.totalVisits}</td>
                <td>${item.visitsOver20Min}</td>
                <td>${item.percentOver20Min.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function generateReportHTML(data: ProviderWeekData[], summaryStats: any, insights: any[]): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Provider Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: white; }
          h1 { color: #1e3a8a; }
          h2 { color: #3b82f6; margin-top: 30px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .summary-card { background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; }
          .summary-card h3 { margin: 0 0 10px 0; color: #1e40af; font-size: 14px; }
          .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #1e3a8a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #4f46e5; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .insights { margin: 20px 0; }
          .insight { padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid; }
          .insight.top { background: #d1fae5; border-color: #10b981; }
          .insight.improved { background: #dbeafe; border-color: #3b82f6; }
          .insight.attention { background: #fee2e2; border-color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>Provider Analytics Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <h2>Summary Statistics</h2>
        <div class="summary">
          <div class="summary-card">
            <h3>Total Providers</h3>
            <p>${summaryStats.totalProviders}</p>
          </div>
          <div class="summary-card">
            <h3>Total Visits</h3>
            <p>${summaryStats.totalVisits.toLocaleString()}</p>
          </div>
          <div class="summary-card">
            <h3>Avg % Over 20 Min</h3>
            <p>${summaryStats.avgPercentOver20Min.toFixed(1)}%</p>
          </div>
          <div class="summary-card">
            <h3>Trend</h3>
            <p>${summaryStats.trendValue !== 0 ? (summaryStats.trendValue > 0 ? '+' : '') + summaryStats.trendValue.toFixed(1) + '%' : 'No change'}</p>
          </div>
        </div>

        ${insights.length > 0 ? `
          <h2>Key Insights</h2>
          <div class="insights">
            ${insights.map(insight => `
              <div class="insight ${insight.type}">
                <strong>${insight.title}:</strong> ${insight.description}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <h2>Detailed Data</h2>
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Week</th>
              <th>Total Visits</th>
              <th>Visits Over 20 Min</th>
              <th>% Over 20 Min</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.provider}</td>
                <td>${item.week}</td>
                <td>${item.totalVisits.toLocaleString()}</td>
                <td>${item.visitsOver20Min.toLocaleString()}</td>
                <td>${item.percentOver20Min.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
}
