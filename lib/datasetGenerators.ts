import {
  FormattedDataRow,
  ElementsRow,
  ChartOfAccountsRow,
  BudgetTrackerRow,
  PurchaseOrderRow,
} from './types';

// Segment names for the Elements dataset
const SEGMENT_NAMES = [
  'Segment 1', 'Segment 2', 'Segment 3', 'Segment 4',
  'Segment 5', 'Segment 6', 'Segment 7', 'Segment 8',
  'Segment 9', 'Segment 10', 'Segment 11', 'Segment 12'
];

/**
 * Generates the Elements dataset
 * Creates a 3-column list of all unique segment codes and their descriptions
 */
export function generateElements(formattedData: FormattedDataRow[]): ElementsRow[] {
  const elements: ElementsRow[] = [];

  // Process each of the 12 segments
  for (let i = 1; i <= 12; i++) {
    const segKey = `seg${i}` as keyof FormattedDataRow;
    const descKey = `desc${i}` as keyof FormattedDataRow;

    // Collect unique values with their descriptions
    const uniqueValues = new Map<string, string>();

    formattedData.forEach((row) => {
      const value = row[segKey] as string;
      const description = row[descKey] as string;

      if (value && value.trim() !== '') {
        // Store first occurrence of description for each value
        if (!uniqueValues.has(value)) {
          uniqueValues.set(value, description || '');
        }
      }
    });

    // Convert to array and sort by value
    const sortedValues = Array.from(uniqueValues.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    // Add to elements array
    sortedValues.forEach(([value, description]) => {
      elements.push({
        'Element Type': SEGMENT_NAMES[i - 1],
        'Number': value,
        'Description': description,
      });
    });
  }

  return elements;
}

/**
 * Generates the Chart of Accounts dataset
 * Produces unique pairs of full account code and account description
 */
export function generateChartOfAccounts(formattedData: FormattedDataRow[]): ChartOfAccountsRow[] {
  const accountsMap = new Map<string, string>();

  formattedData.forEach((row) => {
    if (row.FullAccountCode && row.FullAccountCode.trim() !== '') {
      const key = `${row.FullAccountCode}|${row.AccountDescription}`;
      if (!accountsMap.has(key)) {
        accountsMap.set(key, row.AccountDescription);
      }
    }
  });

  return Array.from(accountsMap.entries()).map(([key, description]) => ({
    'Account': key.split('|')[0],
    'Description': description,
  }));
}

/**
 * Generates the Budget Tracker dataset
 * Aggregates budget data by account code and description
 */
export function generateBudgetTracker(formattedData: FormattedDataRow[]): BudgetTrackerRow[] {
  const budgetMap = new Map<string, BudgetTrackerRow>();

  formattedData.forEach((row) => {
    if (!row.FullAccountCode || row.FullAccountCode.trim() === '') {
      return; // Skip rows without account code
    }

    const key = `${row.FullAccountCode}|${row.AccountDescription}`;

    if (budgetMap.has(key)) {
      // Accumulate sums
      const existing = budgetMap.get(key)!;
      existing.Budget += row.sumapp;
      existing.Expense += row.sumexp;
      existing.Encumbrance += row.sumenc;
    } else {
      // Create new entry
      budgetMap.set(key, {
        'Account': row.FullAccountCode,
        'Description': row.AccountDescription,
        'Budget': row.sumapp,
        'Expense': row.sumexp,
        'Encumbrance': row.sumenc,
      });
    }
  });

  return Array.from(budgetMap.values());
}

/**
 * Generates the Purchase Order dataset
 * Produces subset of original data focusing on purchase orders
 */
export function generatePurchaseOrder(formattedData: FormattedDataRow[]): PurchaseOrderRow[] {
  // Filter rows where ponum (L column) is not empty
  const filteredData = formattedData.filter(
    (row) => row.ponum && row.ponum.trim() !== ''
  );

  // Map to purchase order rows
  const purchaseOrders = filteredData.map((row) => ({
    'Account': row.FullAccountCode,
    'Description': row.AccountDescription,
    'PO Date': row.effdate,
    'Expense': row.sumexp,
    'Encumbrance': row.sumenc,
    'PO Number': row.ponum,
    'Vendor': row.name,
    'Item Description': row.descrip_a,
  }));

  // Sort by PO Number ascending
  purchaseOrders.sort((a, b) => a['PO Number'].localeCompare(b['PO Number']));

  return purchaseOrders;
}
