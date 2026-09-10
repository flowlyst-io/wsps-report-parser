import * as XLSX from 'xlsx';
import { SourceDataRow } from './types';
import { ParseResult, collectHeaderErrors } from './sourceSchema';

/**
 * Turns one spreadsheet cell into the string the rest of the app expects.
 *
 * Everything downstream was written against PapaParse, which hands back
 * strings and nothing else. `padToWidth` and `toNumber` both call `.trim()`
 * on what they are given, so a real spreadsheet number reaching them throws.
 * Stringifying everything the same way is wrong in both directions, though:
 *
 *   - Take the displayed text everywhere, and a currency-formatted amount
 *     arrives as "$1,234.50". `parseFloat` gives NaN, `toNumber` returns 0,
 *     and money is silently zeroed with no error on screen.
 *   - Take the raw value everywhere, and a real date cell arrives as its
 *     serial number, "45915", which lands verbatim in the PO Date column.
 *
 * So the choice is made per cell type: numbers use the raw value, dates use
 * the text Excel would show, and anything else is passed through trimmed.
 */
function cellToString(cell: XLSX.CellObject | undefined): string {
  if (!cell || cell.v === undefined || cell.v === null) return '';

  switch (cell.t) {
    case 'n': {
      // A date read without conversion stays numeric but carries a date
      // number format. Those want their displayed text, not the serial.
      if (cell.z && XLSX.SSF.is_date(String(cell.z)) && cell.w) {
        return cell.w.trim();
      }
      // Otherwise the raw number, so no currency or thousands mask can
      // confuse the parseFloat that follows downstream.
      return String(cell.v);
    }

    case 'd': {
      // A real date: show what Excel shows, so the output matches what the
      // same report produces when it is exported as CSV instead.
      if (cell.w) return cell.w.trim();
      // A date-typed cell is not guaranteed to hold a Date. Anything else
      // here is read as text rather than crashing the whole file on one cell.
      if (!(cell.v instanceof Date)) return String(cell.v).trim();
      return isNaN(cell.v.getTime()) ? '' : cell.v.toISOString().slice(0, 10);
    }

    case 'b':
      return cell.v ? 'TRUE' : 'FALSE';

    case 'e':
      // An error cell (#N/A, #REF!) keeps its text, which is what the same
      // cell looks like once Excel writes it to a CSV. Reading it as blank
      // instead would be worse than it sounds: descrip_b is half the key the
      // Budget Tracker groups on, so a blank there quietly merges two
      // accounts into one row. Left as text, a broken cell stays visible.
      return cell.w ? cell.w.trim() : String(cell.v).trim();

    default:
      return String(cell.v).trim();
  }
}

/**
 * Works out which cells a sheet actually holds, ignoring the range it claims.
 *
 * A workbook states its own used range and SheetJS passes that on without
 * checking it, so the claim can be wrong in either direction and both hurt:
 *
 *   - Too large: Excel writes A1:XFD1048576 for a file holding two rows.
 *     Walking that literally is 17 billion lookups on the browser's main
 *     thread — minutes of a frozen tab under a "Reading your file…" message
 *     that never changes.
 *   - Too small: a stale dimension of A1:B2 over ten rows of data means the
 *     rest is never read. That one is silent, and worse for it — the file
 *     looks like it was read, and the missing rows just are not in the totals.
 *
 * The cells present are the only reliable answer, and finding them costs one
 * pass over them.
 */
function populatedRange(sheet: XLSX.WorkSheet): XLSX.Range | null {
  let firstRow = Infinity;
  let firstColumn = Infinity;
  let lastRow = -Infinity;
  let lastColumn = -Infinity;

  for (const key of Object.keys(sheet)) {
    // Sheet metadata is keyed by a leading "!", cells by their address.
    if (key.startsWith('!')) continue;

    const address = XLSX.utils.decode_cell(key);
    if (!Number.isInteger(address.r) || !Number.isInteger(address.c)) continue;
    if (address.r < 0 || address.c < 0) continue;

    if (address.r < firstRow) firstRow = address.r;
    if (address.c < firstColumn) firstColumn = address.c;
    if (address.r > lastRow) lastRow = address.r;
    if (address.c > lastColumn) lastColumn = address.c;
  }

  if (lastRow === -Infinity) return null;

  return {
    s: { r: firstRow, c: firstColumn },
    e: { r: lastRow, c: lastColumn },
  };
}

/**
 * Gives every column a distinct name, matching what PapaParse does to a CSV
 * with a repeated header: the first keeps the name, later ones get "_1",
 * "_2" and so on. Without this the last duplicate would overwrite the first
 * and the two formats would disagree about the same file.
 */
function makeHeadersUnique(headers: string[]): string[] {
  // Every name in the row is spoken for before renaming starts, including
  // ones further right. Headers of ["s1", "s1", "s1_1"] give s1, s1_2, s1_1:
  // the duplicate skips past the s1_1 that is coming, rather than colliding
  // with it and letting the later column silently win. PapaParse does the
  // same, and the two readers have to agree on the same file.
  const used = new Set(headers.filter((header) => header !== ''));
  const seen = new Set<string>();
  const counts = new Map<string, number>();

  return headers.map((header) => {
    if (header === '') return '';

    if (!seen.has(header)) {
      seen.add(header);
      return header;
    }

    let count = counts.get(header) ?? 0;
    let candidate: string;
    do {
      count += 1;
      candidate = `${header}_${count}`;
    } while (used.has(candidate));

    counts.set(header, count);
    used.add(candidate);
    return candidate;
  });
}

/**
 * Reads the first sheet of an Excel workbook into the same row shape
 * PapaParse produces for the CSV export.
 *
 * Handles both the modern .xlsx zip format and the older binary .xls
 * layouts, including the BIFF2 stream the ERP actually emits.
 */
export async function parseSpreadsheet(file: File): Promise<ParseResult> {
  let workbook: XLSX.WorkBook;

  try {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, {
      type: 'array',
      // Turn real date cells into Dates so they can be told apart from
      // ordinary numbers, and keep number formats so cellToString can see them.
      cellDates: true,
      cellNF: true,
      cellText: true,
    });
  } catch {
    return {
      data: [],
      errors: ['That file could not be read as a spreadsheet. It may be damaged, or saved in a format this tool does not recognise.'],
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { data: [], errors: ['This workbook has no sheets in it.'] };
  }

  const sheet = workbook.Sheets[sheetName];
  const range = sheet ? populatedRange(sheet) : null;
  if (!range) {
    return { data: [], errors: ['No data rows found in the spreadsheet'] };
  }

  // Row 1 is the header row, matching how the CSV export is laid out.
  const rawHeaders: string[] = [];
  for (let column = range.s.c; column <= range.e.c; column++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: column })];
    rawHeaders.push(cellToString(cell));
  }
  const headers = makeHeadersUnique(rawHeaders);

  const errors = collectHeaderErrors(headers);
  if (errors.length > 0) {
    return { data: [], errors };
  }

  const rows: SourceDataRow[] = [];
  for (let rowIndex = range.s.r + 1; rowIndex <= range.e.r; rowIndex++) {
    const row: Record<string, string> = {};
    let hasValue = false;

    for (let column = range.s.c; column <= range.e.c; column++) {
      const header = headers[column - range.s.c];
      if (!header) continue;

      const value = cellToString(
        sheet[XLSX.utils.encode_cell({ r: rowIndex, c: column })]
      );
      row[header] = value;
      if (value !== '') hasValue = true;
    }

    // Skip blank rows, the way the CSV reader's skipEmptyLines does.
    if (hasValue) rows.push(row as unknown as SourceDataRow);
  }

  if (rows.length === 0) {
    errors.push('No data rows found in the spreadsheet');
  }

  return { data: rows, errors };
}
