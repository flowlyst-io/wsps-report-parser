# WSPS Detailed Expenditure Report Parser

A lightweight, client-side web application that transforms WSPS (West Springfield Public Schools) Detailed Expenditure Reports into structured datasets.

## Features

- **CSV or Excel Input**: Reads the ERP export as a `.csv` or as an Excel file, including the older `.xls` formats
- **Client-side Processing**: All data processing happens in your browser - no server uploads
- **Fast Performance**: Handles up to 100,000 rows efficiently
- **Four Output Datasets**:
  - **Elements**: Unique segment codes with descriptions
  - **Chart of Accounts**: Full account codes with descriptions
  - **Budget Tracker**: Aggregated budget data by account
  - **Purchase Order**: Filtered purchase order information
- **Easy Export**: Download individual CSVs or all datasets as a ZIP file
- **Optional Header Row**: On by default, and one checkbox turns it off for every download
- **Real-time Preview**: View first 20 rows of each dataset before downloading

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## How to Use

1. Export the Detailed Expenditure Report from your ERP system, as a CSV or an Excel file
2. Upload it using the drag-and-drop zone
3. Wait for processing (typically 2-5 seconds for large files)
4. Review the generated datasets in the preview tables
5. Leave "Include a header row" ticked, or untick it to get files with no header row
6. Download individual datasets or all datasets as a ZIP file

## Technical Details

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **CSV Parsing**: PapaParse
- **Excel Parsing**: SheetJS (loaded on demand, only when an Excel file is chosen)
- **ZIP Generation**: JSZip

### Data Processing Pipeline

1. **Parsing**: Validates the file, then reads it with PapaParse (`.csv`) or SheetJS (Excel). Both readers return rows in the same shape, so everything after this point is the same code for either format. They agree on data; the two documented differences below are in row counting and error wording, not in any output file.
2. **Data Transformation**:
   - Extracts segments (s1-s12) and descriptions (sd1-sd12, descrip_b)
   - Pads segments with leading zeros to fixed widths
   - Concatenates segments into FullAccountCode
3. **Dataset Generation**:
   - **Elements**: Collects unique segment values across all 12 segments
   - **Chart of Accounts**: Deduplicates account code/description pairs
   - **Budget Tracker**: Aggregates sumapp, sumexp, sumenc by account
   - **Purchase Order**: Filters by ponum and selects specific columns
4. **Export**: Converts datasets to CSV format using PapaParse

### Reading Excel cells

A CSV holds only text. A spreadsheet holds typed cells, so each one is turned
into text by its type, because neither blanket rule is safe:

- **Numbers** use the raw value, not the displayed text. A currency-formatted
  cell displays as `$1,234.50`, which `parseFloat` reads as `NaN` and the app
  would then treat as `0` — silently wrong, with no error on screen.
- **Dates** use the displayed text, not the raw value. A real date cell holds
  a serial number like `45915`, which would otherwise land in the PO Date
  column verbatim.
- **Everything else** is passed through trimmed. Error cells (`#N/A`, `#REF!`)
  keep their text, which is both what Excel writes to a CSV and what keeps a
  broken cell visible — read as blank, an error in `descrip_b` would quietly
  merge two accounts into one Budget Tracker row.

### Speed

Measured on a 2,399-row export, 3 runs each: the CSV path takes 66-85 ms, the
Excel path 1,229-1,308 ms — roughly 18x slower for the same report. Transform
and all four generators add 13-32 ms.

At this size that is about a second and a quarter, which the "Reading your
file…" state covers. It does not scale: extrapolated to the 100,000 rows
PRD section 6 targets, the Excel path would take around 52 seconds on the
browser's main thread, so the tab would be frozen rather than slow. The ERP's
own format cannot hold that many rows, but a `.xlsx` saved out of Excel can.
Moving the parse to a Web Worker is the fix if that ever matters.

### One known difference between the two formats

A row whose cells are all empty is skipped when reading a spreadsheet, but a
CSV line of `,,,,` is kept by PapaParse as a row of empty strings. So the
"rows read" count can differ by the number of all-blank rows in the file.

No output file is affected. All four generators skip rows with no account
code — `generateElements` and `generateChartOfAccounts` test for a non-empty
value, `generateBudgetTracker` returns early, and `generatePurchaseOrder`
filters on a non-empty `ponum` — so an all-blank row contributes to none of
them. The difference is confined to the count shown on screen.

Adding the Excel reader also changed the CSV reader's wording in two cases,
because both now share one header check: a CSV with none of the expected
columns, and an empty file, get the "does not look like a Detailed
Expenditure Report" message instead of a list of all 32 column names. Every
other case is unchanged, and no output file is affected.

### Column Mapping

The application maps CSV columns to internal fields:

- Segments: `s1` through `s12` (columns 17-28)
- Descriptions: `sd1` through `sd12`, `descrip_b` (columns 29-41)
- Account Description: `descrip_b` (column 41)
- Budget columns: `sumapp`, `sumexp`, `sumenc` (columns 14-16)
- Purchase Order: `ponum`, `effdate`, `descrip_a`, `name` (columns 12, 3, 5, 99)

### Segment Padding Widths

| Segment | Width |
|---------|-------|
| 1       | 4     |
| 2       | 3     |
| 3       | 2     |
| 4       | 4     |
| 5       | 2     |
| 6       | 4     |
| 7       | 1     |
| 8       | 3     |
| 9       | 2     |
| 10      | 3     |
| 11      | 2     |
| 12      | 3     |

## Project Structure

```
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── components/
│   ├── UploadZone.tsx    # File upload component
│   └── ResultCard.tsx    # Dataset preview card
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── sourceFile.ts     # Picks a reader by file extension
│   ├── sourceSchema.ts   # Required columns, shared by both readers
│   ├── csvParser.ts      # CSV parsing
│   ├── spreadsheetParser.ts # Excel parsing
│   ├── dataTransformer.ts # Data transformation logic
│   ├── datasetGenerators.ts # Dataset generation functions
│   └── exportUtils.ts    # CSV/ZIP export utilities
└── docs/
    └── PRD.md            # Product Requirements Document
```

## Privacy & Security

- **No Server Communication**: All processing happens client-side in the browser
- **No Data Storage**: Files are processed in memory and discarded after use
- **No Analytics**: No tracking or data collection
- **Local Only**: Safe for sensitive financial data

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

© 2025 Flowlyst. All rights reserved.

## Support

For issues or questions, please contact Flowlyst support.
