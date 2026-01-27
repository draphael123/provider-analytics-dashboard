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
  const dataRows = excelData.slice(1);
  
  console.log('Excel headers:', headers);
  console.log('Number of data rows:', dataRows.length);
  console.log('First data row sample:', dataRows[0]);
  
  const result: ProviderWeekData[] = [];
  
  // Find the provider column index (usually first column)
  const providerColIndex = 0;
  
  // Group columns by week
  const weekMap = new Map<string, { total?: number; over20?: number; percent?: number; avg?: number; hours?: number }>();
  
  // First pass: Look for week headers that contain the week date
  headers.forEach((header, idx) => {
    if (idx === providerColIndex) return;
    
    const headerStr = String(header || '').trim();
    if (!headerStr) return;
    
    // Try multiple patterns for week identification
    let weekMatch = headerStr.match(/week\s+of\s+(\d{1,2}\/\d{1,2})/i);
    if (!weekMatch) {
      weekMatch = headerStr.match(/(\d{1,2}\/\d{1,2})/);
    }
    
    if (weekMatch) {
      const weekKey = `Week of ${weekMatch[1]}`;
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {});
      }
      
      const weekData = weekMap.get(weekKey)!;
      const lowerHeader = headerStr.toLowerCase();
      
      // More flexible matching for column types
      if (lowerHeader.includes('total') && !lowerHeader.includes('over') && !lowerHeader.includes('%')) {
        weekData.total = idx;
        console.log(`Found Total column for ${weekKey} at index ${idx}`);
      } else if (lowerHeader.includes('over') && lowerHeader.includes('20') && !lowerHeader.includes('%')) {
        weekData.over20 = idx;
        console.log(`Found Over 20 column for ${weekKey} at index ${idx}`);
      } else if (lowerHeader.includes('%') || (lowerHeader.includes('percent') && lowerHeader.includes('20'))) {
        weekData.percent = idx;
        console.log(`Found % column for ${weekKey} at index ${idx}`);
      } else if (lowerHeader.includes('avg') || lowerHeader.includes('average') || lowerHeader.includes('duration')) {
        weekData.avg = idx;
        console.log(`Found Avg column for ${weekKey} at index ${idx}`);
      } else if (lowerHeader.includes('hour')) {
        weekData.hours = idx;
        console.log(`Found Hours column for ${weekKey} at index ${idx}`);
      }
    }
  });
  
  console.log('Week map after first pass:', Array.from(weekMap.entries()));
  
  // Alternative: If week grouping didn't work, try sequential column grouping
  // Assume columns are grouped as: Provider | Week1 Total | Week1 Over20 | Week1 % | Week1 Avg | Week2 Total | ...
  if (weekMap.size === 0) {
    // Try to detect week patterns in sequential columns
    let currentWeek = '';
    let colOffset = 0;
    
    for (let i = 1; i < headers.length; i++) {
      const headerStr = String(headers[i] || '').trim().toLowerCase();
      
      // Detect new week
      if (headerStr.includes('week') || headerStr.match(/\d{1,2}\/\d{1,2}/)) {
        const weekMatch = headerStr.match(/(\d{1,2}\/\d{1,2})/);
        if (weekMatch) {
          currentWeek = `Week of ${weekMatch[1]}`;
          colOffset = 0;
        } else if (headerStr.includes('week')) {
          // Extract week number or date
          const weekNumMatch = headerStr.match(/week\s+(\d+)/i);
          if (weekNumMatch) {
            currentWeek = `Week ${weekNumMatch[1]}`;
            colOffset = 0;
          }
        }
      }
      
      if (currentWeek) {
        if (!weekMap.has(currentWeek)) {
          weekMap.set(currentWeek, {});
        }
        
        const weekData = weekMap.get(currentWeek)!;
        
        if (colOffset === 0 || headerStr.includes('total')) {
          weekData.total = i;
        } else if (colOffset === 1 || headerStr.includes('over') && headerStr.includes('20') && !headerStr.includes('%')) {
          weekData.over20 = i;
        } else if (colOffset === 2 || headerStr.includes('%') || headerStr.includes('percent')) {
          weekData.percent = i;
        } else if (colOffset === 3 || headerStr.includes('avg') || headerStr.includes('average')) {
          weekData.avg = i;
        } else if (colOffset === 4 || headerStr.includes('hour')) {
          weekData.hours = i;
        }
        
        colOffset++;
      }
    }
  }
  
  // If weekMap is empty or incomplete, try alternative parsing strategies
  if (weekMap.size === 0 || Array.from(weekMap.values()).some(w => !w.total && !w.over20)) {
    console.log('Week map incomplete, trying alternative parsing...');
    
    // Strategy: Look for patterns where columns are grouped sequentially
    // Try to find week indicators and then look for metric columns nearby
    const weekIndicators: Array<{ index: number; week: string }> = [];
    
    headers.forEach((header, idx) => {
      if (idx === providerColIndex) return;
      const headerStr = String(header || '').trim();
      if (!headerStr) return;
      
      const weekMatch = headerStr.match(/(\d{1,2}\/\d{1,2})/);
      if (weekMatch) {
        weekIndicators.push({ index: idx, week: `Week of ${weekMatch[1]}` });
      }
    });
    
    // If we found week indicators, try to map columns around them
    if (weekIndicators.length > 0) {
      console.log('Found week indicators:', weekIndicators);
      
      for (let i = 0; i < weekIndicators.length; i++) {
        const weekInfo = weekIndicators[i];
        const nextWeekIndex = i < weekIndicators.length - 1 ? weekIndicators[i + 1].index : headers.length;
        const weekKey = weekInfo.week;
        
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, {});
        }
        
        const weekData = weekMap.get(weekKey)!;
        
        // Look for metric columns between this week indicator and the next
        for (let col = weekInfo.index + 1; col < nextWeekIndex && col < headers.length; col++) {
          const colHeader = String(headers[col] || '').toLowerCase().trim();
          if (!colHeader) continue;
          
          if (!weekData.total && (colHeader.includes('total') || colHeader === 'total')) {
            weekData.total = col;
          } else if (!weekData.over20 && (colHeader.includes('over') && colHeader.includes('20') && !colHeader.includes('%'))) {
            weekData.over20 = col;
          } else if (!weekData.percent && (colHeader.includes('%') || (colHeader.includes('percent') && colHeader.includes('20')))) {
            weekData.percent = col;
          } else if (!weekData.avg && (colHeader.includes('avg') || colHeader.includes('average') || colHeader.includes('duration'))) {
            weekData.avg = col;
          } else if (!weekData.hours && colHeader.includes('hour')) {
            weekData.hours = col;
          }
        }
      }
    }
  }
  
  // If still no weeks found, try a simpler approach: assume 4-5 columns per week
  if (weekMap.size === 0) {
    // Try to detect column patterns by looking at header content
    let columnsPerWeek = 4; // Default: Total, Over20, %, Avg
    const hasHours = headers.some(h => String(h || '').toLowerCase().includes('hour'));
    if (hasHours) columnsPerWeek = 5;
    
    // Try to find week patterns in headers to determine grouping
    const weekHeaders: number[] = [];
    headers.forEach((header, idx) => {
      const headerStr = String(header || '').toLowerCase();
      if (headerStr.includes('week') || headerStr.match(/\d{1,2}\/\d{1,2}/)) {
        weekHeaders.push(idx);
      }
    });
    
    if (weekHeaders.length > 0) {
      // Group columns between week headers
      for (let i = 0; i < weekHeaders.length; i++) {
        const weekStartCol = weekHeaders[i];
        const weekEndCol = i < weekHeaders.length - 1 ? weekHeaders[i + 1] : headers.length;
        const weekLabel = String(headers[weekStartCol] || `Week ${i + 1}`).trim();
        const normalizedWeek = weekLabel.match(/(\d{1,2}\/\d{1,2})/) 
          ? `Week of ${weekLabel.match(/(\d{1,2}\/\d{1,2})/)![1]}`
          : weekLabel;
        
        // Find metric columns in this week's range
        const weekData: { total?: number; over20?: number; percent?: number; avg?: number; hours?: number } = {};
        for (let col = weekStartCol + 1; col < weekEndCol; col++) {
          const colHeader = String(headers[col] || '').toLowerCase();
          if (colHeader.includes('total') && !colHeader.includes('over')) {
            weekData.total = col;
          } else if (colHeader.includes('over') && colHeader.includes('20') && !colHeader.includes('%')) {
            weekData.over20 = col;
          } else if (colHeader.includes('%') || (colHeader.includes('percent') && colHeader.includes('20'))) {
            weekData.percent = col;
          } else if (colHeader.includes('avg') || colHeader.includes('average')) {
            weekData.avg = col;
          } else if (colHeader.includes('hour')) {
            weekData.hours = col;
          }
        }
        
        if (Object.keys(weekData).length > 0) {
          weekMap.set(normalizedWeek, weekData);
        }
      }
    } else {
      // Fallback: assume fixed columns per week
      const numWeeks = Math.floor((headers.length - 1) / columnsPerWeek);
      
      for (let weekIdx = 0; weekIdx < numWeeks; weekIdx++) {
        const startCol = 1 + (weekIdx * columnsPerWeek);
        const weekLabel = `Week ${weekIdx + 1}`;
        
        weekMap.set(weekLabel, {
          total: startCol,
          over20: startCol + 1,
          percent: startCol + 2,
          avg: startCol + 3,
          hours: columnsPerWeek === 5 ? startCol + 4 : undefined,
        });
      }
    }
  }
  
  // Process data rows
  dataRows.forEach((row, rowIdx) => {
    const provider = String(row[providerColIndex] || '').trim();
    if (!provider || provider === 'Provider' || provider === '') return;
    
    // For each week
    weekMap.forEach((indices, week) => {
      // Get raw values from the row
      const totalVisitsRaw = row[indices.total ?? -1];
      const visitsOver20MinRaw = row[indices.over20 ?? -1];
      const percentOver20MinRaw = row[indices.percent ?? -1];
      const avgDurationRaw = row[indices.avg ?? -1];
      const hoursOn20PlusMinRaw = indices.hours ? row[indices.hours] : undefined;
      
      // Parse values, handling various formats
      let totalVisits = 0;
      let visitsOver20Min = 0;
      let percentOver20Min = 0;
      let avgDuration = 0;
      
      if (totalVisitsRaw !== null && totalVisitsRaw !== undefined && totalVisitsRaw !== '') {
        totalVisits = typeof totalVisitsRaw === 'number' ? totalVisitsRaw : parseFloat(String(totalVisitsRaw)) || 0;
      }
      
      if (visitsOver20MinRaw !== null && visitsOver20MinRaw !== undefined && visitsOver20MinRaw !== '') {
        visitsOver20Min = typeof visitsOver20MinRaw === 'number' ? visitsOver20MinRaw : parseFloat(String(visitsOver20MinRaw)) || 0;
      }
      
      if (percentOver20MinRaw !== null && percentOver20MinRaw !== undefined && percentOver20MinRaw !== '') {
        percentOver20Min = typeof percentOver20MinRaw === 'number' ? percentOver20MinRaw : parseFloat(String(percentOver20MinRaw)) || 0;
      }
      
      if (avgDurationRaw !== null && avgDurationRaw !== undefined && avgDurationRaw !== '') {
        avgDuration = typeof avgDurationRaw === 'number' ? avgDurationRaw : parseFloat(String(avgDurationRaw)) || 0;
      }
      
      // Calculate percentage if not provided
      if (percentOver20Min === 0 && totalVisits > 0) {
        percentOver20Min = (visitsOver20Min / totalVisits) * 100;
      }
      
      const hoursOn20PlusMin = hoursOn20PlusMinRaw !== null && hoursOn20PlusMinRaw !== undefined && hoursOn20PlusMinRaw !== ''
        ? (typeof hoursOn20PlusMinRaw === 'number' ? hoursOn20PlusMinRaw : parseFloat(String(hoursOn20PlusMinRaw)) || undefined)
        : undefined;
      
      // Debug first few rows
      if (rowIdx < 2 && week === Array.from(weekMap.keys())[0]) {
        console.log(`Parsing row ${rowIdx} for ${provider}, week ${week}:`, {
          totalVisitsRaw,
          totalVisits,
          visitsOver20MinRaw,
          visitsOver20Min,
          indices
        });
      }
      
      result.push({
        provider,
        week,
        totalVisits,
        visitsOver20Min,
        percentOver20Min,
        avgDuration,
        hoursOn20PlusMin,
      });
    });
  });
  
  console.log('Parsed provider data:', result.length, 'records');
  if (result.length === 0) {
    console.warn('No data parsed. Headers:', headers);
    console.warn('Week map:', Array.from(weekMap.entries()));
    console.warn('Data rows:', dataRows.length);
  }
  
  return result;
}

