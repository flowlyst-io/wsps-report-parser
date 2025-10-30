// Types for the WSPS Report Parser

export interface SourceDataRow {
  // Raw CSV row data - using actual column headers from the CSV
  year_a: string;
  accountn_a: string;
  effdate: string;
  rectype: string;
  descrip_a: string;
  ref1: string;
  ref2: string;
  ref3: string;
  ref4: string;
  ref5: string;
  packetid: string;
  ponum: string;
  vendorid: string;
  sumapp: string;
  sumexp: string;
  sumenc: string;
  s1: string;
  s2: string;
  s3: string;
  s4: string;
  s5: string;
  s6: string;
  s7: string;
  s8: string;
  s9: string;
  s10: string;
  s11: string;
  s12: string;
  sd1: string;
  sd2: string;
  sd3: string;
  sd4: string;
  sd5: string;
  sd6: string;
  sd7: string;
  sd8: string;
  sd9: string;
  sd10: string;
  sd11: string;
  sd12: string;
  descrip_b: string;
  sdescrip: string;
  accountn_b: string;
  controlacc: string;
  cashacc: string;
  fullacc: string;
  acctype: string;
  cash_con: string;
  tempvar: string;
  cy_app: string;
  cy_amend: string;
  cy_transin: string;
  cy_transout: string;
  cy_enc: string;
  cy_exp: string;
  cy_bal: string;
  cy_cf: string;
  cy_avail: string;
  cy_aexp: string;
  cy_aenc: string;
  cy_used: string;
  cy_cr: string;
  cy_db: string;
  year_b: string;
  active: string;
  gp_app: string;
  gp_amend: string;
  gp_transin: string;
  gp_transout: string;
  gp_enc: string;
  gp_exp: string;
  gp_bal: string;
  gp_cf: string;
  gp_avail: string;
  gp_aexp: string;
  gp_aenc: string;
  gp_db: string;
  gp_cr: string;
  cy_rec: string;
  gp_rec: string;
  recacc: string;
  defrevd: string;
  defrevc: string;
  bs_code: string;
  cy_ar: string;
  cy_er: string;
  gp_ar: string;
  gp_er: string;
  sched_a: string;
  cy_cfe: string;
  gp_cfe: string;
  udfld1: string;
  udfld2: string;
  udfld3: string;
  udfld4: string;
  close_fb: string;
  ny_acct: string;
  vendor_id: string;
  name: string;
  dba: string;
  address1: string;
  address2: string;
  address3: string;
  strnum: string;
  strname: string;
  apt_pobox: string;
  city: string;
  state: string;
  zip: string;
  madd1: string;
  madd2: string;
  mcity: string;
  mstate: string;
  mzip: string;
  phone1: string;
  phone2: string;
  contact1: string;
  contact2: string;
  email: string;
  fax: string;
  ssnum: string;
  fidnum: string;
  product: string;
  performanc: string;
  use1099: string;
  parent: string;
  status: string;
  same: string;
  year_c: string;
  seldomused: string;
  suspect: string;
  hidename: string;
  added_by: string;
  added_on: string;
  change_by: string;
  change_on: string;
  madd3: string;
  madd4: string;
  vd_code: string;
  oncheckas: string;
  contact3: string;
  phone3: string;
  website: string;
  v_ctype: string;
  v_acct: string;
  box_1099: string;
}

export interface FormattedDataRow {
  // Padded segments
  seg1: string;
  seg2: string;
  seg3: string;
  seg4: string;
  seg5: string;
  seg6: string;
  seg7: string;
  seg8: string;
  seg9: string;
  seg10: string;
  seg11: string;
  seg12: string;
  // Computed full account code
  FullAccountCode: string;
  // Descriptions
  desc1: string;
  desc2: string;
  desc3: string;
  desc4: string;
  desc5: string;
  desc6: string;
  desc7: string;
  desc8: string;
  desc9: string;
  desc10: string;
  desc11: string;
  desc12: string;
  desc13: string;
  // Account description from column AO (descrip_b)
  AccountDescription: string;
  // Original data needed for other datasets
  sumapp: number;
  sumexp: number;
  sumenc: number;
  ponum: string;
  effdate: string;
  descrip_a: string;
  name: string;
}

export interface ElementsRow {
  'Element Type': string;
  'Number': string;
  'Description': string;
}

export interface ChartOfAccountsRow {
  'Account': string;
  'Description': string;
}

export interface BudgetTrackerRow {
  'Account': string;
  'Description': string;
  'Budget': number;
  'Expense': number;
  'Encumbrance': number;
}

export interface PurchaseOrderRow {
  'Account': string;
  'Description': string;
  'PO Date': string;
  'Expense': number;
  'Encumbrance': number;
  'PO Number': string;
  'Vendor': string;
  'Item Description': string;
}

export interface ProcessedData {
  elements: ElementsRow[];
  chartOfAccounts: ChartOfAccountsRow[];
  budgetTracker: BudgetTrackerRow[];
  purchaseOrder: PurchaseOrderRow[];
}
