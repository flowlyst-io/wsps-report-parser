import { FormattedDataRow } from './types';

/**
 * Looks for rows whose account code does not have the same number of segments
 * as the rest of the file.
 *
 * A line that is not really data — a total, a note, a page footer left in by
 * the report writer — still becomes a row, and its first cell becomes a whole
 * account code. `total` joins to the account code "total", which then appears
 * in Chart of Accounts and carries whatever amounts sat on that line into the
 * Budget Tracker. Nothing on screen says anything is wrong.
 *
 * Nothing is dropped here, deliberately. Rejecting an odd-looking code would
 * mean deciding what a valid account looks like, and being wrong about that
 * would remove a real account from the output — invisible, where a junk row
 * is at least visible. So this counts and reports, and leaves the data alone.
 *
 * The comparison is against the file itself rather than a fixed pattern, so it
 * does not care whether segments are numbers or letters, or how many there
 * are. It only cares that one row disagrees with the others.
 */
export function findOddAccountCodes(formattedData: FormattedDataRow[]): string[] {
  const counts = new Map<number, number>();

  for (const row of formattedData) {
    if (!row.FullAccountCode) continue;
    const segments = row.FullAccountCode.split('-').length;
    counts.set(segments, (counts.get(segments) ?? 0) + 1);
  }

  // Too few account codes to say what normal looks like.
  if (counts.size < 2) return [];

  let usual = 0;
  let usualCount = 0;
  for (const [segments, count] of counts) {
    if (count > usualCount) {
      usual = segments;
      usualCount = count;
    }
  }

  const odd: string[] = [];
  for (const [segments, count] of counts) {
    if (segments === usual) continue;
    odd.push(
      `${count.toLocaleString()} ${count === 1 ? 'row has' : 'rows have'} an account code made of ` +
        `${segments} ${segments === 1 ? 'part' : 'parts'} rather than ${usual}`
    );
  }

  return odd;
}
