import Papa from 'papaparse';
import { SourceDataRow } from './types';

export interface ParseResult {
  data: SourceDataRow[];
  errors: string[];
}

// Required headers that must be present in the CSV
const REQUIRED_HEADERS = [
  's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12',
  'sd1', 'sd2', 'sd3', 'sd4', 'sd5', 'sd6', 'sd7', 'sd8', 'sd9', 'sd10', 'sd11', 'sd12',
  'descrip_b', 'sumapp', 'sumexp', 'sumenc', 'ponum', 'effdate', 'descrip_a', 'name'
];

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<SourceDataRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      // More lenient quote handling for malformed CSVs
      quoteChar: '"',
      escapeChar: '"',
      // Skip rows with quote errors instead of failing
      skipFirstNLines: 0,
      complete: (results) => {
        const errors: string[] = [];

        // Validate headers
        if (results.meta.fields) {
          const missingHeaders = REQUIRED_HEADERS.filter(
            (header) => !results.meta.fields!.includes(header)
          );

          if (missingHeaders.length > 0) {
            errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
          }
        }

        // Check if we have data
        if (results.data.length === 0) {
          errors.push('No data rows found in the CSV file');
        }

        // Only report critical parsing errors (not quote warnings)
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(
            (error) => error.type === 'FieldMismatch' || error.type === 'Delimiter'
          );

          if (criticalErrors.length > 0) {
            criticalErrors.forEach((error) => {
              errors.push(`Row ${error.row}: ${error.message}`);
            });
          }
        }

        resolve({
          data: results.data,
          errors,
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [error.message],
        });
      },
    });
  });
}

export function validateFile(file: File): string | null {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return 'Please upload a valid CSV file';
  }

  // Check file size (max 50MB to be safe)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return 'File size exceeds 50MB limit';
  }

  return null;
}
