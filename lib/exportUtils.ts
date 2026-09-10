import Papa from 'papaparse';
import JSZip from 'jszip';
import {
  ElementsRow,
  ChartOfAccountsRow,
  BudgetTrackerRow,
  PurchaseOrderRow,
} from './types';

/**
 * Converts an array of objects to a CSV string, with or without a header row.
 * The row types are keyed by the column names themselves, so the header line
 * needs no translation.
 */
function arrayToCSV<T extends object>(data: T[], includeHeaders: boolean): string {
  return Papa.unparse(data, {
    header: includeHeaders,
  });
}

/**
 * Triggers a browser download for a file
 */
function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Elements dataset as CSV
 */
export function downloadElements(data: ElementsRow[], includeHeaders: boolean) {
  const csv = arrayToCSV(data, includeHeaders);
  downloadFile(csv, 'elements.csv', 'text/csv');
}

/**
 * Downloads Chart of Accounts dataset as CSV
 */
export function downloadChartOfAccounts(
  data: ChartOfAccountsRow[],
  includeHeaders: boolean
) {
  const csv = arrayToCSV(data, includeHeaders);
  downloadFile(csv, 'chart_of_accounts.csv', 'text/csv');
}

/**
 * Downloads Budget Tracker dataset as CSV
 */
export function downloadBudgetTracker(
  data: BudgetTrackerRow[],
  includeHeaders: boolean
) {
  const csv = arrayToCSV(data, includeHeaders);
  downloadFile(csv, 'budget_tracker.csv', 'text/csv');
}

/**
 * Downloads Purchase Order dataset as CSV
 */
export function downloadPurchaseOrder(
  data: PurchaseOrderRow[],
  includeHeaders: boolean
) {
  const csv = arrayToCSV(data, includeHeaders);
  downloadFile(csv, 'purchase_order.csv', 'text/csv');
}

/**
 * Downloads all datasets as a ZIP file
 */
export async function downloadAllAsZip(
  elements: ElementsRow[],
  chartOfAccounts: ChartOfAccountsRow[],
  budgetTracker: BudgetTrackerRow[],
  purchaseOrder: PurchaseOrderRow[],
  includeHeaders: boolean
) {
  const zip = new JSZip();

  // Add each CSV to the ZIP
  zip.file('elements.csv', arrayToCSV(elements, includeHeaders));
  zip.file('chart_of_accounts.csv', arrayToCSV(chartOfAccounts, includeHeaders));
  zip.file('budget_tracker.csv', arrayToCSV(budgetTracker, includeHeaders));
  zip.file('purchase_order.csv', arrayToCSV(purchaseOrder, includeHeaders));

  // Generate ZIP and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(blob, 'flowlyst_wsps_outputs.zip', 'application/zip');
}
