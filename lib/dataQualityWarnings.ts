import { FormattedDataRow } from './types';

/**
 * Points at rows that look like they are not really data.
 *
 * A total, a note, or a page footer left in by the report writer still becomes
 * a row. What it does next depends on which cell its text lands in, and two of
 * those outcomes reach a file the user then imports:
 *
 *   - Text in a segment column becomes a whole account code. `TOTAL` appears
 *     in Chart of Accounts, in Elements as a segment value of its own, and
 *     carries whatever amounts sat on that line into the Budget Tracker —
 *     three of the four files.
 *   - Text in `ponum` leaves the account code empty, so the account-code
 *     checks skip the row — but Purchase Order filters on `ponum` being
 *     present, so the row arrives there with a blank Account.
 *
 * Nothing is dropped. Rejecting a row would mean deciding what a valid account
 * looks like, and being wrong about that would remove a real account from the
 * output — invisible, where a junk row is at least visible. So these count and
 * report, and leave the data alone.
 *
 * Both tests are structural. Neither looks at what a segment contains, because
 * whether a WSPS segment can hold a letter is an open question, and a rule
 * that guessed wrong about it would be judging real accounts.
 *
 * Known limits, both of them one guess away from being worse than useless:
 *
 *   - A junk line occupying two cells produces a two-part code and is missed.
 *   - An account that genuinely uses only one segment produces a one-part code
 *     and cannot be told apart from junk. Whether WSPS has such accounts is
 *     unanswered; the message is phrased so it stays true either way, and the
 *     check stays silent unless the file contains both shapes.
 */
export function findDataQualityWarnings(formattedData: FormattedDataRow[]): string[] {
  let singleValued = 0;
  let multiPart = 0;
  let poWithoutAccount = 0;

  for (const row of formattedData) {
    if (row.FullAccountCode) {
      // Relies on no segment value containing a hyphen itself. Checked against
      // the real export: 0 of 28,788 segment cells contain one.
      if (row.FullAccountCode.split('-').length === 1) singleValued++;
      else multiPart++;
    } else if (row.ponum.trim() !== '') {
      // Mirrors generatePurchaseOrder's own test exactly. A plain truthiness
      // check would agree with it only because both readers happen to trim
      // their values, and a whitespace-only PO number would then be counted
      // here while never appearing in the file this message points at.
      poWithoutAccount++;
    }
  }

  const warnings: string[] = [];

  // Only worth saying when the file holds both shapes. A file where every code
  // is a single value has no "rest" to contrast against, and a notice flagging
  // all of it against a claim the reader can disprove is worse than silence.
  if (singleValued > 0 && multiPart > 0) {
    warnings.push(
      `${singleValued.toLocaleString()} ${singleValued === 1 ? 'row has' : 'rows have'} ` +
        'an account code made of one segment, where the rest are split into several parts by dashes'
    );
  }

  if (poWithoutAccount > 0) {
    warnings.push(
      `${poWithoutAccount.toLocaleString()} ${poWithoutAccount === 1 ? 'row has' : 'rows have'} ` +
        'a PO number but no account code, so ' +
        `${poWithoutAccount === 1 ? 'it appears' : 'they appear'} in Purchase Order with the Account column blank`
    );
  }

  return warnings;
}
