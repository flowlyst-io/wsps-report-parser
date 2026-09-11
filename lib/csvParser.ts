import Papa from 'papaparse';
import { SourceDataRow } from './types';
import { ParseResult, collectHeaderErrors } from './sourceSchema';

export type { ParseResult };

/** How many bad rows to name before summarising the rest. */
const MAX_ROW_ERRORS = 3;

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

          // One line per bad row, capped. A file whose header row has a
          // different number of fields to its data rows produces one of these
          // for every row in it, and all of them end up joined into a single
          // sentence on screen — 2,399 rows once measured at 142,863
          // characters, burying the one line worth reading.
          criticalErrors.slice(0, MAX_ROW_ERRORS).forEach((error) => {
            errors.push(`Row ${error.row}: ${error.message}`);
          });

          const hidden = criticalErrors.length - MAX_ROW_ERRORS;
          if (hidden > 0) {
            errors.push(
              `and ${hidden.toLocaleString()} more ${hidden === 1 ? 'row' : 'rows'} with the same kind of problem`
            );
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
