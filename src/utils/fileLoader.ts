import { parseExcelFile } from './dataParser';
import { ProviderWeekData } from '../types';

/**
 * Loads an Excel file from the public folder and parses it
 */
export async function loadDefaultExcelFile(filename: string = '/Doxy - Over 20 minutes (9).xlsx'): Promise<ProviderWeekData[]> {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    const file = new File([blob], filename.split('/').pop() || 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    return await parseExcelFile(file);
  } catch (error) {
    console.error('Error loading default file:', error);
    throw error;
  }
}

