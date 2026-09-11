# **Flowlyst WSPS Detailed Expenditure Report Parser**

### Version

v1.0 — MVP PRD
Prepared by: **Tural Novruzov**
Date: **October 2025**

---

## **1. Overview**

The **Flowlyst WSPS Detailed Expenditure Report Parser** is a lightweight, client-side web tool that replicates and automates the logic currently implemented in a Google Sheets workbook used by West Springfield Public Schools (WSPS).

Users currently paste the **Detailed Expenditure Report** into a “data sheet,” and several other sheets derive structured outputs like *Elements*, *Chart of Accounts*, *Budget Tracker*, and *Purchase Order* through complex formulas.

This application replaces that manual process by allowing users to **upload the exported report file** from their ERP system, as a CSV or an Excel file and automatically generating these four derived datasets, displayed on the website with options to download each as a CSV (or all together as a ZIP).

No authentication, database, or backend is required — all transformations occur securely in the user’s browser.

---

## **2. Goals**

### **Primary Goal**

Transform the Google Sheets-based workflow for WSPS into an automated, browser-based utility that reproduces the exact output of the existing workbook with 100% fidelity in formatting, logic, and calculations.

### **Key Objectives**

* Replicate all formulas, transformations, and structural logic from the Sheets file.
* Support uploads up to **100,000 rows**.
* Produce four derived datasets:

  1. **Elements**
  2. **Chart of Accounts**
  3. **Budget Tracker**
  4. **Purchase Order**
* Display the generated tables in the web UI.
* Provide “Download CSV” for each dataset and a “Download All” button for a ZIP export.

---

## **3. Non-Goals**

The MVP intentionally excludes:

* Authentication or user accounts
* Persistent data storage or server-side APIs
* Editing or filtering of results in the browser
* Database integration
* Mobile optimization beyond basic responsiveness

---

## **4. Technology Stack**

| Layer              | Technology                            |
| ------------------ | ------------------------------------- |
| Frontend Framework | **Next.js (latest, App Router)**      |
| Language           | **TypeScript**                        |
| Styling            | **TailwindCSS**                       |
| CSV Parsing        | **PapaParse** or equivalent           |
| Excel Parsing      | **SheetJS**, loaded on demand         |
| ZIP Generation     | **JSZip**                             |
| Data Handling      | All client-side (browser memory only) |
| Deployment         | Static or Vercel-compatible           |

---

## **5. User Flow**

### **1. Upload**

* User opens the single-page application.
* A large, branded drop zone invites users to upload their **Detailed Expenditure Report**, as a CSV or an Excel file.
* File validation:

  * Must be a `.csv` or an Excel file (`.xls`, `.xlsx`, `.xlsm`, `.xlsb`). The ERP emits BIFF2, an old binary `.xls`, which is why the Excel reader covers more than `.xlsx`.
  * Must contain required headers (as defined in section 7.1).
* Once validated, file parses automatically (no submit button).

### **2. Processing**

* Client-side script parses up to 100,000 rows.
* Runs the transformations described in section 7 to generate:

  * **Formatted Data** (internal intermediate structure)
  * **Elements**
  * **Chart of Accounts**
  * **Budget Tracker**
  * **Purchase Order**

### **3. Display**

* After processing completes:

  * Four collapsible cards appear, one for each dataset.
  * Each card shows:

    * Dataset name
    * Row count
    * Table preview (first 20 rows, scrollable)
    * “Download CSV” button
  * Top-level “Download All (.zip)” button available above the cards.

### **4. Download**

* Clicking “Download CSV” triggers client-side file creation and download.
* Clicking “Download All” bundles all four CSVs into a ZIP and downloads as `flowlyst_wsps_outputs.zip`.

---

## **6. Performance & Security**

| Aspect      | Requirement                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------- |
| File Size   | Must handle up to 100,000 rows smoothly (optimize parsing, avoid blocking main thread).        |
| Performance | Parsing and transformation should complete within ~5 seconds for 100k rows on a modern laptop. |
| Privacy     | No network calls. All processing happens locally in the browser.                               |
| Memory      | Optimize object creation; use streaming parse where possible.                                  |
| Resilience  | Gracefully handle malformed rows or missing values.                                            |

**Measured, and where the Excel path falls short of the row above.** On a
2,399-row export the CSV path takes 66–85 ms and the Excel path
1,229–1,308 ms — 14× to 18× slower for the same report, by two separate
harnesses. Extrapolated to 100,000 rows the Excel path is around 52 seconds on
the main thread, so the ~5 second target is met by the CSV path and **not** by
the Excel path. The ERP's own BIFF2 format cannot hold that many rows, but an
`.xlsx` saved out of Excel can.

---

## **7. Data Processing Logic**

### **7.1 Source Data**

The uploaded file is the **DETAILED EXPENDITURE REPORT ON** export, as a CSV or an Excel file. Both readers return the same rows, so everything after parsing is one code path.
It always contains the same headers and structure as the Google Sheets input.

Critical columns used in downstream logic include:

* `Q:AB` — segment codes (12 total)
* `AC:AO` — segment descriptions (13 total)
* `N`, `O`, `P` — numeric amounts used in Budget Tracker
* `L` — field used in Purchase Order filtering and sorting
* `EQ` (calculated in Sheets) — Full Account Code (to be re-computed here)

The parser must recreate the same transformations the Sheets currently perform.

---

### **7.2 Step 1 – Formatted Data**

**Purpose:** normalize segment codes, pad them to fixed widths, concatenate into a full account code, and attach descriptions.

#### **Logic**

1. Extract columns Q–AB as `segments[1..12]`.
2. For each segment, left-pad with zeros based on the defined widths:

| Segment Index | Width |
| ------------- | ----- |
| 1             | 4     |
| 2             | 3     |
| 3             | 2     |
| 4             | 4     |
| 5             | 2     |
| 6             | 4     |
| 7             | 1     |
| 8             | 3     |
| 9             | 2     |
| 10            | 3     |
| 11            | 2     |
| 12            | 3     |

```ts
function padToWidth(value: string, width: number): string {
  if (!value) return "";
  const text = String(value);
  return text.length >= width ? text : text.padStart(width, "0");
}
```

3. Build `FullAccountCode` exactly as Sheets does:

   ```ts
   const fullCode = segments.filter(Boolean).join("-");
   ```

   (Empty segments are skipped, preventing double dashes.)

4. Extract columns AC–AO as descriptions (`desc1..desc13`).

**Output structure (internal only):**
| seg1–seg12 | FullAccountCode | desc1–desc13 |

---

### **7.3 Step 2 – Elements**

**Purpose:** generate a 3-column list of all unique segment codes and their descriptions.

#### **Logic**

For each of the 12 segments:

1. Segment name = header from `FormattedData` (A1–L1).
2. Values = unique, non-empty codes from that column.
3. Description = look up the first match for each code in the corresponding `desc` column.
4. Sort values ascending.
5. Output rows as:

| Segment | Value | Description |

Combine all segments vertically under a single header row.

---

### **7.4 Step 3 – Chart of Accounts**

**Purpose:** produce unique pairs of full account code and account description.

#### **Logic**

1. Take `FullAccountCode` (column M in FormattedData).
2. Take `AccountDescription` (column Z in FormattedData — corresponds to `Sdescrip` or equivalent human-readable description).
3. Deduplicate rows on `(FullAccountCode, Description)`.

**Output columns:**
| FullAccountCode | Description |

---

### **7.5 Step 4 – Budget Tracker**

**Purpose:** aggregate budget data by account code and description.

#### **Logic**

Equivalent to Google Sheets query:

```sql
SELECT Col1, Col2, SUM(Col3), SUM(Col4), SUM(Col5)
WHERE Col1 IS NOT NULL
GROUP BY Col1, Col2
```

1. Combine:

   * Col1: `FullAccountCode`
   * Col2: `AccountDescription`
   * Col3: SourceData column N
   * Col4: SourceData column O
   * Col5: SourceData column P
2. Convert numeric strings to numbers; treat blanks as 0.
3. Group by `(FullAccountCode, Description)` and sum numeric columns.

**Output columns:**
| FullAccountCode | Description | Sum(Col3) | Sum(Col4) | Sum(Col5) |

---

### **7.6 Step 5 – Purchase Order**

**Purpose:** produce subset of the original data focusing on purchase orders.

#### **Logic**

Equivalent to:

```sql
SELECT EQ, AO, C, O, P, L, CU, E
WHERE L IS NOT NULL
ORDER BY L
```

1. Columns to include (in order):

   * EQ (computed FullAccountCode)
   * AO
   * C
   * O
   * P
   * L
   * CU
   * E
2. Filter rows where `L` is empty or null.
3. Sort by `L` ascending.

**Output columns:**
| FullAccountCode | AO | C | O | P | L | CU | E |

---

## **8. User Interface**

### **Layout**

* Single page, minimal navigation.
* Responsive, clean Tailwind design.
* Flowlyst brand colors and typography applied later (configurable via Tailwind theme).

### **Sections**

#### **1. Header**

* Left: Flowlyst logo placeholder + app title “WSPS Detailed Expenditure Report Parser”
* Right: Optional version tag (“v1.0”)

#### **2. Upload Area**

* Large drop zone with dashed border.
* Text: *“Drop your report here”*, with *“CSV or Excel — or choose a file from your computer”* beneath it.
* Once uploaded:

  * Show filename and row count.
  * Display “Re-upload file” option.

#### **3. Results Section**

Visible after successful parse:

* “Download All (.zip)” button
* Four collapsible cards:

  1. **Elements**
  2. **Chart of Accounts**
  3. **Budget Tracker**
  4. **Purchase Order**

Each card includes:

* Header with dataset name and row count.
* Tailwind-styled table (max-height: 400px, scrollable).
* Footer with:

  * “Download CSV” button.
  * “Showing first 20 of X rows” text.

#### **4. Error States**

* Invalid file type → *“Please upload a CSV or Excel file (.csv, .xls or .xlsx)”*
* Some headers missing → *“Missing required columns: [list]”*
* No headers recognised → *“This does not look like a Detailed Expenditure Report. None of the expected columns are in it — check that the right file was exported.”* Listing all 32 names at someone who picked the wrong file tells them nothing, so the two cases read differently.
* Empty file → *“No data rows found in the CSV file”*, or *“No data rows found in the spreadsheet”*
* Too large → *“File size exceeds 50MB limit”*

---

## **9. File Naming**

| Dataset           | Download Filename           |
| ----------------- | --------------------------- |
| Elements          | `elements.csv`              |
| Chart of Accounts | `chart_of_accounts.csv`     |
| Budget Tracker    | `budget_tracker.csv`        |
| Purchase Order    | `purchase_order.csv`        |
| All (ZIP)         | `flowlyst_wsps_outputs.zip` |

---

## **10. Acceptance Criteria**

✅ Uploads a WSPS report, CSV or Excel, up to 100,000 rows (see the note under section 6 on Excel at that size)
✅ Generates 4 derived datasets with identical logic to current Google Sheets formulas
✅ Displays each dataset in the web UI
✅ Each dataset can be downloaded individually as CSV
✅ “Download All” provides ZIP of all four CSVs
✅ Padding, concatenation, and summation logic produce the same output as Google Sheets (1:1 match)
✅ No backend or network calls — all runs locally
✅ Handles missing/empty cells gracefully
✅ Uses Flowlyst brand styling via Tailwind theme

---

## **11. Future Enhancements (Beyond MVP)**

* Allow preview filtering/search in result tables.
* Optional Excel (.xlsx) export.
* Persist the uploaded report in browser (IndexedDB).
* Versioning / changelog display.
* Batch processing of multiple district exports.
* Drag-and-drop of zipped folder with multiple reports.

---

## **12. Summary**

This MVP will let users — particularly district finance staff — instantly transform their exported **Detailed Expenditure Report** into the standardized data tables used across Flowlyst systems.

It replaces a manual, formula-driven Google Sheets process with a zero-install, zero-backend browser tool that faithfully reproduces the same outputs, ensuring consistency and ease of use.
