import Papa from 'papaparse';
import JSZip from 'jszip';
import {
  ElementsRow,
  ChartOfAccountsRow,
  BudgetTrackerRow,
  PurchaseOrderRow,
} from './types';

/**
 * Converts an array of objects to CSV string WITHOUT headers
 */
function arrayToCSV<T extends object>(data: T[]): string {
  return Papa.unparse(data, {
    header: false, // No headers in the CSV output
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
export function downloadElements(data: ElementsRow[]) {
  const csv = arrayToCSV(data);
  downloadFile(csv, 'elements.csv', 'text/csv');
}

/**
 * Downloads Chart of Accounts dataset as CSV
 */
export function downloadChartOfAccounts(data: ChartOfAccountsRow[]) {
  const csv = arrayToCSV(data);
  downloadFile(csv, 'chart_of_accounts.csv', 'text/csv');
}

/**
 * Downloads Budget Tracker dataset as CSV
 */
export function downloadBudgetTracker(data: BudgetTrackerRow[]) {
  const csv = arrayToCSV(data);
  downloadFile(csv, 'budget_tracker.csv', 'text/csv');
}

/**
 * Downloads Purchase Order dataset as CSV
 */
export function downloadPurchaseOrder(data: PurchaseOrderRow[]) {
  const csv = arrayToCSV(data);
  downloadFile(csv, 'purchase_order.csv', 'text/csv');
}

/**
 * Downloads all datasets as a ZIP file
 */
export async function downloadAllAsZip(
  elements: ElementsRow[],
  chartOfAccounts: ChartOfAccountsRow[],
  budgetTracker: BudgetTrackerRow[],
  purchaseOrder: PurchaseOrderRow[]
) {
  const zip = new JSZip();

  // Add each CSV to the ZIP
  zip.file('elements.csv', arrayToCSV(elements));
  zip.file('chart_of_accounts.csv', arrayToCSV(chartOfAccounts));
  zip.file('budget_tracker.csv', arrayToCSV(budgetTracker));
  zip.file('purchase_order.csv', arrayToCSV(purchaseOrder));

  // Generate ZIP and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(blob, 'flowlyst_wsps_outputs.zip', 'application/zip');
}
