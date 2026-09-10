import { SourceDataRow } from './types';

export interface ParseResult {
  data: SourceDataRow[];
  errors: string[];
}

// Columns the four datasets cannot be built without. Both the CSV reader and
// the spreadsheet reader check this same list, so a file that is rejected in
// one format is rejected in the other, with the same wording.
export const REQUIRED_HEADERS = [
  's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12',
  'sd1', 'sd2', 'sd3', 'sd4', 'sd5', 'sd6', 'sd7', 'sd8', 'sd9', 'sd10', 'sd11', 'sd12',
  'descrip_b', 'sumapp', 'sumexp', 'sumenc', 'ponum', 'effdate', 'descrip_a', 'name'
];

/**
 * Checks a file's header row against REQUIRED_HEADERS and returns one error
 * message per problem found. An empty array means the headers are usable.
 */
export function collectHeaderErrors(fields: string[] | undefined): string[] {
  if (!fields) return [];

  const missing = REQUIRED_HEADERS.filter((header) => !fields.includes(header));
  if (missing.length === 0) return [];

  // None of the expected columns are there, so this is almost certainly the
  // wrong file rather than a report with a column missing. Listing all 32
  // names at someone who picked the wrong file tells them nothing.
  if (missing.length === REQUIRED_HEADERS.length) {
    return [
      'This does not look like a Detailed Expenditure Report. None of the expected columns are in it — check that the right file was exported.',
    ];
  }

  return [`Missing required columns: ${missing.join(', ')}`];
}
