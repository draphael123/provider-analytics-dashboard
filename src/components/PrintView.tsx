import { useEffect } from 'react';
import { ProviderWeekData, SummaryStats } from '../types';

interface PrintViewProps {
  data: ProviderWeekData[];
  stats: SummaryStats;
  onClose: () => void;
}

export function PrintView({ data, stats, onClose }: PrintViewProps) {
  useEffect(() => {
    // Trigger print dialog
    window.print();
    
    // Close after print
    const handleAfterPrint = () => {
      onClose();
    };
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onClose]);

  return (
    <div className="print-view p-8 bg-white text-black">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-view, .print-view * {
            visibility: visible;
          }
          .print-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="mb-6 no-print">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          Close Print View
        </button>
      </div>

      <div className="print-content">
        <h1 className="text-3xl font-bold mb-4">Provider Analytics Report</h1>
        <p className="text-gray-600 mb-6">Generated: {new Date().toLocaleString()}</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border p-4">
            <p className="text-sm text-gray-600">Total Providers</p>
            <p className="text-2xl font-bold">{stats.totalProviders}</p>
          </div>
          <div className="border p-4">
            <p className="text-sm text-gray-600">Total Visits</p>
            <p className="text-2xl font-bold">{stats.totalVisits.toLocaleString()}</p>
          </div>
          <div className="border p-4">
            <p className="text-sm text-gray-600">Avg % Over 20 Min</p>
            <p className="text-2xl font-bold">{stats.avgPercentOver20Min.toFixed(1)}%</p>
          </div>
          <div className="border p-4">
            <p className="text-sm text-gray-600">Trend</p>
            <p className="text-2xl font-bold">
              {stats.trendValue !== 0 ? `${stats.trendValue > 0 ? '+' : ''}${stats.trendValue.toFixed(1)}%` : 'No change'}
            </p>
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Provider</th>
              <th className="border border-gray-300 p-2 text-left">Week</th>
              <th className="border border-gray-300 p-2 text-right">Total Visits</th>
              <th className="border border-gray-300 p-2 text-right">Over 20 Min</th>
              <th className="border border-gray-300 p-2 text-right">% Over 20 Min</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{item.provider}</td>
                <td className="border border-gray-300 p-2">{item.week}</td>
                <td className="border border-gray-300 p-2 text-right">{item.totalVisits.toLocaleString()}</td>
                <td className="border border-gray-300 p-2 text-right">{item.visitsOver20Min.toLocaleString()}</td>
                <td className="border border-gray-300 p-2 text-right">{item.percentOver20Min.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

