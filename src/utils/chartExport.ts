// Chart export utilities - using canvas API for chart export
export async function exportChartAsPNG(chartElement: HTMLElement, _filename: string = 'chart.png') {
  try {
    // Use Recharts' built-in export or canvas conversion
    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in chart');
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);
          }
        }, 'image/png');
      }
    };
    img.src = svgUrl;
  } catch (error) {
    console.error('Error exporting chart:', error);
    // Fallback: use print/screenshot method
    window.print();
  }
}

export async function exportMultipleChartsAsPDF(charts: HTMLElement[], filename: string = 'dashboard-report.pdf') {
  // For PDF export of multiple charts, we'll use a library like jsPDF
  // This is a simplified version that creates a printable HTML page
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .chart-container { margin: 20px 0; page-break-inside: avoid; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <h1>Provider Analytics Dashboard Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        ${charts.map((chart, index) => {
          // Note: html2canvas would need to be imported and used here
          // For now, using a placeholder approach
          return `<div class="chart-container"><p>Chart ${index + 1}</p></div>`;
        }).join('')}
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

