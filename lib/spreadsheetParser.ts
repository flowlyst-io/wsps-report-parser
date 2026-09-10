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
      const date = cell.v as Date;
      return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
    }

    case 'b':
      return cell.v ? 'TRUE' : 'FALSE';

    case 'e':
      // An error cell (#N/A, #REF!) is not a value. Treat it as blank so it
      // reads the same as an empty cell rather than becoming the text "#N/A".
      return '';

    default:
      return String(cell.v).trim();
  }
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
  if (!sheet || !sheet['!ref']) {
    return { data: [], errors: ['No data rows found in the spreadsheet'] };
  }

  const range = XLSX.utils.decode_range(sheet['!ref']);

  // Row 1 is the header row, matching how the CSV export is laid out.
  const headers: string[] = [];
  for (let column = range.s.c; column <= range.e.c; column++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: column })];
    headers.push(cellToString(cell));
  }

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
