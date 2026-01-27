import * as XLSX from 'xlsx';
import { ProviderWeekData } from '../types';

type ExcelCellValue = string | number | boolean | null | undefined;
type ExcelRow = ExcelCellValue[];
type ExcelData = ExcelRow[];

export function parseExcelFile(file: File): Promise<ProviderWeekData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: null });
        
        const parsedData = parseProviderData(jsonData as ExcelData);
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function parseProviderData(excelData: ExcelData): ProviderWeekData[] {
  if (!excelData || excelData.length === 0) {
    return [];
  }

  const headers = excelData[0];
  const dataRows = excelData.slice(1).filter(row => row && row.length > 0);
  
  console.log('Excel headers:', headers);
  console.log('Number of data rows:', dataRows.length);
  if (dataRows.length > 0) {
    console.log('First data row sample:', dataRows[0]);
  }
  
  const result: ProviderWeekData[] = [];
  const providerColIndex = 0;
  
  // Strategy 1: Find all week dates in headers and map columns to weeks
  const weekMap = new Map<string, { total?: number; over20?: number; percent?: number; avg?: number; hours?: number }>();
  
  // First, identify all week dates in the headers
  const weekDates: Array<{ date: string; index: number }> = [];
  headers.forEach((header, idx) => {
    if (idx === providerColIndex) return;
    const headerStr = String(header || '').trim();
    const dateMatch = headerStr.match(/(\d{1,2}\/\d{1,2})/);
    if (dateMatch) {
      weekDates.push({ date: dateMatch[1], index: idx });
    }
  });
  
  console.log('Found week dates:', weekDates);
  
  // Group columns by week - look for week headers and then find metric columns
  weekDates.forEach((weekDate, weekIdx) => {
    const weekKey = `Week of ${weekDate.date}`;
    const nextWeekIndex = weekIdx < weekDates.length - 1 ? weekDates[weekIdx + 1].index : headers.length;
    
    // Look backwards and forwards from the week date to find metric columns
    const weekStart = Math.max(providerColIndex + 1, weekDate.index - 5);
    const weekEnd = Math.min(headers.length, nextWeekIndex);
    
    const weekData: { total?: number; over20?: number; percent?: number; avg?: number; hours?: number } = {};
    
    // Scan columns in this week's range
    for (let col = weekStart; col < weekEnd; col++) {
      const colHeader = String(headers[col] || '').trim().toLowerCase();
      if (!colHeader) continue;
      
      // Match column types more flexibly
      if (!weekData.total && (
        colHeader === 'total' || 
        colHeader.includes('total') && !colHeader.includes('over') && !colHeader.includes('%')
      )) {
        weekData.total = col;
      } else if (!weekData.over20 && (
        colHeader.includes('over') && colHeader.includes('20') && !colHeader.includes('%')
      )) {
        weekData.over20 = col;
      } else if (!weekData.percent && (
        colHeader.includes('%') || 
        (colHeader.includes('percent') && colHeader.includes('20')) ||
        colHeader.includes('pct')
      )) {
        weekData.percent = col;
      } else if (!weekData.avg && (
        colHeader.includes('avg') || 
        colHeader.includes('average') || 
        colHeader.includes('duration') ||
        colHeader.includes('avg duration')
      )) {
        weekData.avg = col;
      } else if (!weekData.hours && colHeader.includes('hour')) {
        weekData.hours = col;
      }
    }
    
    // If we found at least one metric column, add this week
    if (Object.keys(weekData).length > 0) {
      weekMap.set(weekKey, weekData);
      console.log(`Mapped ${weekKey}:`, weekData);
    }
  });
  
  // Strategy 2: If week dates found but no metrics, try sequential grouping
  if (weekDates.length > 0 && weekMap.size === 0) {
    console.log('Trying sequential grouping based on week dates...');
    weekDates.forEach((weekDate, weekIdx) => {
      const weekKey = `Week of ${weekDate.date}`;
      const nextWeekIndex = weekIdx < weekDates.length - 1 ? weekDates[weekIdx + 1].index : headers.length;
      const colsBetween = nextWeekIndex - weekDate.index - 1;
      
      // Assume standard order: Total, Over 20, %, Avg, Hours (if present)
      if (colsBetween >= 3) {
        weekMap.set(weekKey, {
          total: weekDate.index + 1,
          over20: weekDate.index + 2,
          percent: weekDate.index + 3,
          avg: weekDate.index + 4,
          hours: colsBetween >= 5 ? weekDate.index + 5 : undefined,
        });
        console.log(`Sequential mapping for ${weekKey}:`, weekMap.get(weekKey));
      }
    });
  }
  
  // Strategy 3: Fallback - assume fixed column pattern
  if (weekMap.size === 0) {
    console.log('Using fallback: fixed column pattern');
    const columnsPerWeek = 4; // Total, Over20, %, Avg
    const numWeeks = Math.floor((headers.length - 1) / columnsPerWeek);
    
    for (let weekIdx = 0; weekIdx < numWeeks && weekIdx < 52; weekIdx++) {
      const startCol = 1 + (weekIdx * columnsPerWeek);
      const weekLabel = `Week ${weekIdx + 1}`;
      
      weekMap.set(weekLabel, {
        total: startCol,
        over20: startCol + 1,
        percent: startCol + 2,
        avg: startCol + 3,
      });
    }
  }
  
  console.log('Final week map:', Array.from(weekMap.entries()));
  
  // Process data rows
  dataRows.forEach((row, rowIdx) => {
    const provider = String(row[providerColIndex] || '').trim();
    if (!provider || provider === 'Provider' || provider === '' || provider.toLowerCase() === 'total') {
      return;
    }
    
    // For each week
    weekMap.forEach((indices, week) => {
      // Extract values with better type handling
      const getValue = (colIndex: number | undefined): number => {
        if (colIndex === undefined || colIndex < 0 || colIndex >= row.length) return 0;
        const value = row[colIndex];
        if (value === null || value === undefined || value === '') return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      };
      
      const totalVisits = getValue(indices.total);
      const visitsOver20Min = getValue(indices.over20);
      let percentOver20Min = getValue(indices.percent);
      const avgDuration = getValue(indices.avg);
      const hoursOn20PlusMin = indices.hours !== undefined ? getValue(indices.hours) : undefined;
      
      // Calculate percentage if not provided or is 0
      if (percentOver20Min === 0 && totalVisits > 0) {
        percentOver20Min = (visitsOver20Min / totalVisits) * 100;
      }
      
      // Debug first few rows
      if (rowIdx < 3 && week === Array.from(weekMap.keys())[0]) {
        console.log(`Row ${rowIdx} - ${provider}, ${week}:`, {
          totalCol: indices.total,
          totalValue: totalVisits,
          over20Col: indices.over20,
          over20Value: visitsOver20Min,
          percentCol: indices.percent,
          percentValue: percentOver20Min,
          avgCol: indices.avg,
          avgValue: avgDuration,
          rawRow: row.slice(0, 10) // First 10 columns
        });
      }
      
      // Only add if we have some data
      if (totalVisits > 0 || visitsOver20Min > 0 || avgDuration > 0) {
        result.push({
          provider,
          week,
          totalVisits,
          visitsOver20Min,
          percentOver20Min,
          avgDuration,
          hoursOn20PlusMin: hoursOn20PlusMin !== undefined && hoursOn20PlusMin > 0 ? hoursOn20PlusMin : undefined,
        });
      }
    });
  });
  
  console.log('Parsed provider data:', result.length, 'records');
  if (result.length === 0) {
    console.warn('No data parsed!');
    console.warn('Headers:', headers);
    console.warn('Week map:', Array.from(weekMap.entries()));
    console.warn('Sample row:', dataRows[0]);
  } else {
    console.log('Sample parsed data:', result.slice(0, 5));
  }
  
  return result;
}
