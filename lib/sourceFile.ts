import { ParseResult } from './sourceSchema';
import { parseCSV } from './csvParser';

/** Extensions the app will read, lower-cased. */
const CSV_EXTENSIONS = ['.csv'];
const SPREADSHEET_EXTENSIONS = ['.xls', '.xlsx', '.xlsm', '.xlsb'];

/** What the file picker offers, and what the on-screen copy should match. */
export const ACCEPTED_FILE_TYPES = [
  ...CSV_EXTENSIONS,
  ...SPREADSHEET_EXTENSIONS,
].join(',');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function extensionOf(file: File): string {
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot);
}

export function isSpreadsheet(file: File): boolean {
  return SPREADSHEET_EXTENSIONS.includes(extensionOf(file));
}

export function validateFile(file: File): string | null {
  const extension = extensionOf(file);

  if (
    !CSV_EXTENSIONS.includes(extension) &&
    !SPREADSHEET_EXTENSIONS.includes(extension)
  ) {
    return 'Please upload a CSV or Excel file (.csv, .xls or .xlsx)';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds 50MB limit';
  }

  return null;
}

/**
 * Reads a report export into rows, picking the reader from the file
 * extension. Both readers return the same shape, so nothing downstream
 * needs to know which format the file arrived in.
 *
 * The spreadsheet reader is loaded on demand: it pulls in a parser that is
 * far larger than the CSV one, and most files are CSVs.
 */
export async function parseSourceFile(file: File): Promise<ParseResult> {
  if (isSpreadsheet(file)) {
    const { parseSpreadsheet } = await import('./spreadsheetParser');
    return parseSpreadsheet(file);
  }

  return parseCSV(file);
}
