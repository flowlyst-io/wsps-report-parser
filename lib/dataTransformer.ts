import { SourceDataRow, FormattedDataRow } from './types';

// Segment widths as defined in PRD section 7.2
const SEGMENT_WIDTHS = [4, 3, 2, 4, 2, 4, 1, 3, 2, 3, 2, 3];

/**
 * Pads a value with leading zeros to the specified width
 */
function padToWidth(value: string | undefined, width: number): string {
  if (!value || value.trim() === '') return '';
  const text = String(value).trim();
  return text.length >= width ? text : text.padStart(width, '0');
}

/**
 * Safely converts a string to a number, returning 0 for empty/invalid values
 */
function toNumber(value: string | undefined): number {
  if (!value || value.trim() === '') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Transforms source data into formatted data with padded segments and full account code
 */
export function transformToFormattedData(sourceData: SourceDataRow[]): FormattedDataRow[] {
  return sourceData.map((row) => {
    // Extract and pad segments
    const segments = [
      row.s1, row.s2, row.s3, row.s4, row.s5, row.s6,
      row.s7, row.s8, row.s9, row.s10, row.s11, row.s12
    ];

    const paddedSegments = segments.map((seg, index) =>
      padToWidth(seg, SEGMENT_WIDTHS[index])
    );

    // Build FullAccountCode by joining non-empty segments with dashes
    const fullCode = paddedSegments.filter(Boolean).join('-');

    // Extract descriptions
    const descriptions = [
      row.sd1, row.sd2, row.sd3, row.sd4, row.sd5, row.sd6,
      row.sd7, row.sd8, row.sd9, row.sd10, row.sd11, row.sd12,
      row.descrip_b
    ];

    return {
      seg1: paddedSegments[0],
      seg2: paddedSegments[1],
      seg3: paddedSegments[2],
      seg4: paddedSegments[3],
      seg5: paddedSegments[4],
      seg6: paddedSegments[5],
      seg7: paddedSegments[6],
      seg8: paddedSegments[7],
      seg9: paddedSegments[8],
      seg10: paddedSegments[9],
      seg11: paddedSegments[10],
      seg12: paddedSegments[11],
      FullAccountCode: fullCode,
      desc1: descriptions[0] || '',
      desc2: descriptions[1] || '',
      desc3: descriptions[2] || '',
      desc4: descriptions[3] || '',
      desc5: descriptions[4] || '',
      desc6: descriptions[5] || '',
      desc7: descriptions[6] || '',
      desc8: descriptions[7] || '',
      desc9: descriptions[8] || '',
      desc10: descriptions[9] || '',
      desc11: descriptions[10] || '',
      desc12: descriptions[11] || '',
      desc13: descriptions[12] || '',
      AccountDescription: row.descrip_b || '',
      sumapp: toNumber(row.sumapp),
      sumexp: toNumber(row.sumexp),
      sumenc: toNumber(row.sumenc),
      ponum: row.ponum || '',
      effdate: row.effdate || '',
      descrip_a: row.descrip_a || '',
      name: row.name || '',
    };
  });
}
