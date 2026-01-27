import { parseExcelFile } from './dataParser';
import { ProviderWeekData } from '../types';

/**
 * Loads an Excel file from the public folder and parses it
 */
export async function loadDefaultExcelFile(filename: string = '/Doxy - Over 20 minutes (9).xlsx'): Promise<ProviderWeekData[]> {
  try {
    console.log('Fetching file from:', filename);
    const response = await fetch(filename);
    console.log('Fetch response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('File loaded, size:', arrayBuffer.byteLength, 'bytes');
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File is empty');
    }
    
    const blob = new Blob([arrayBuffer]);
    const file = new File([blob], filename.split('/').pop() || 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    console.log('Parsing Excel file...');
    const parsedData = await parseExcelFile(file);
    console.log('Parsed data:', parsedData.length, 'records');
    
    if (parsedData.length === 0) {
      throw new Error('No data found in Excel file. Please check the file format.');
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading default file:', error);
    throw error;
  }
}

