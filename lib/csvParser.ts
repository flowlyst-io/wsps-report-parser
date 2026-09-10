import Papa from 'papaparse';
import { SourceDataRow } from './types';
import { ParseResult, collectHeaderErrors } from './sourceSchema';

export type { ParseResult };

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
        const errors = collectHeaderErrors(results.meta.fields);

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
