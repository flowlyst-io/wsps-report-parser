import { FormattedDataRow } from './types';

/**
 * Looks for rows whose account code is a single value with no segments at all.
 *
 * A line that is not really data — a total, a note, a page footer left in by
 * the report writer — still becomes a row, and its text becomes a whole
 * account code. `TOTAL` in a segment column joins to the account code "TOTAL",
 * which then appears in Chart of Accounts and carries whatever amounts sat on
 * that line into the Budget Tracker, with nothing on screen saying so.
 *
 * Such a line puts its text in one cell, so it always yields exactly one part,
 * whichever segment column it lands in. A real account has several. That is
 * the whole test, and it deliberately does not look at what the segments
 * contain: whether a WSPS segment can hold a letter is an open question, and
 * a rule that guessed wrong about it would be judging real accounts.
 *
 * An earlier version compared each row against the most common segment count
 * in the file. That was wrong. PRD section 7.2 builds the code with
 * `segments.filter(Boolean).join("-")` and says empty segments are skipped, so
 * an account with a blank segment is *specified* to be shorter. Warning on
 * those would mean warning about data the spec calls valid — and a notice that
 * appears on good files is one nobody reads.
 *
 * Nothing is dropped. Reporting and leaving the data alone is the point: a
 * junk row in the output is visible, where a real account removed from it
 * would not be.
 *
 * Known limit: a junk line occupying two cells gives two parts and is missed.
 * Widening the test is possible, but nothing has shown that shape yet, and
 * calibrating against a file nobody has seen is guessing.
 */
export function findOddAccountCodes(formattedData: FormattedDataRow[]): string[] {
  let singleValued = 0;

  for (const row of formattedData) {
    if (!row.FullAccountCode) continue;
    // Relies on no segment value containing a hyphen itself. Checked against
    // the real export: 0 of 28,788 segment cells contain one.
    if (row.FullAccountCode.split('-').length === 1) singleValued++;
  }

  if (singleValued === 0) return [];

  return [
    `${singleValued.toLocaleString()} ${singleValued === 1 ? 'row has' : 'rows have'} ` +
      'an account code with no segments in it, where the rest are split into parts by dashes',
  ];
}
