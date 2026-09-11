'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import UploadZone from '@/components/UploadZone';
import ResultCard from '@/components/ResultCard';
import { parseSourceFile, validateFile } from '@/lib/sourceFile';
import { transformToFormattedData } from '@/lib/dataTransformer';
import { findOddAccountCodes } from '@/lib/dataQualityWarnings';
import {
  generateElements,
  generateChartOfAccounts,
  generateBudgetTracker,
  generatePurchaseOrder,
} from '@/lib/datasetGenerators';
import {
  downloadElements,
  downloadChartOfAccounts,
  downloadBudgetTracker,
  downloadPurchaseOrder,
  downloadAllAsZip,
} from '@/lib/exportUtils';
import { ProcessedData } from '@/lib/types';

const STEPS = [
  'Export the Detailed Expenditure Report from your ERP, as a CSV or an Excel file.',
  'Drop it on the box above.',
  'Check the row counts and the previews.',
  'Download the four files, or all four as one ZIP.',
];

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>();
  const [rowCount, setRowCount] = useState<number>();
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const handleFileSelect = useCallback(async (file: File) => {
    // Reset state
    setError(null);
    setProcessedData(null);
    setWarnings([]);
    setRowCount(undefined);
    setFileName(file.name);
    setIsProcessing(true);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setIsProcessing(false);
        return;
      }

      // Parse the file, CSV or Excel
      const parseResult = await parseSourceFile(file);

      if (parseResult.errors.length > 0) {
        setError(parseResult.errors.join('; '));
        setIsProcessing(false);
        return;
      }

      setRowCount(parseResult.data.length);

      // Transform data
      const formattedData = transformToFormattedData(parseResult.data);

      // Nothing is dropped on the strength of this — it only points at rows
      // worth looking at before the numbers are trusted.
      setWarnings(findOddAccountCodes(formattedData));

      // Generate all datasets
      const elements = generateElements(formattedData);
      const chartOfAccounts = generateChartOfAccounts(formattedData);
      const budgetTracker = generateBudgetTracker(formattedData);
      const purchaseOrder = generatePurchaseOrder(formattedData);

      setProcessedData({
        elements,
        chartOfAccounts,
        budgetTracker,
        purchaseOrder,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while reading the file.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownloadAll = useCallback(() => {
    if (!processedData) return;

    downloadAllAsZip(
      processedData.elements,
      processedData.chartOfAccounts,
      processedData.budgetTracker,
      processedData.purchaseOrder,
      includeHeaders
    );
  }, [processedData, includeHeaders]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line-soft">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Image
            src="/flowlyst-logo.svg"
            alt="Flowlyst"
            width={522}
            height={113}
            priority
            className="h-8 w-auto"
          />
          <span className="text-base text-ink-faint">v1.0</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="max-w-2xl">
          <h1 className="text-[2rem] font-extrabold leading-[1.15] tracking-tight text-ink sm:text-[2.375rem]">
            WSPS Detailed Expenditure Report Parser
          </h1>
          <p className="mt-4 text-ink-soft">
            Turn one ERP export into the four files Budget Tracker needs:
            Elements, Chart of Accounts, Budget Tracker and Purchase Order.
          </p>
        </div>

        <div className="mt-10">
          <UploadZone
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            error={error}
            fileName={fileName}
            rowCount={rowCount}
            isComplete={processedData !== null}
          />
        </div>

        {!processedData && !isProcessing && (
          <div className="mt-12 max-w-2xl">
            <h2 className="text-xl font-bold text-ink">How this works</h2>
            <ol className="mt-5 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-base font-extrabold text-ink"
                  >
                    {index + 1}
                  </span>
                  <span className="text-ink-soft">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 border-t border-line-soft pt-6 text-base text-ink-soft">
              Your file never leaves this computer. It is read in the browser,
              and nothing is uploaded to a server or stored anywhere.
            </p>
          </div>
        )}

        {processedData && warnings.length > 0 && (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4"
          >
            <p className="font-bold text-ink">Worth a look before you use these</p>
            <ul className="mt-2 space-y-1 text-base text-ink-soft">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p className="mt-2 text-base text-ink-soft">
              Nothing has been removed — those rows are in the files below. A
              line that is not really data, like a total or a note at the end
              of the report, looks like this.
            </p>
          </div>
        )}

        {processedData && (
          <div className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-ink">Your four files</h2>
              <div className="flex flex-wrap items-center gap-5">
                {/* One switch for every download, so the four CSVs and the ZIP
                    always come out the same way. */}
                <label className="flex items-center gap-2.5 text-base text-ink-soft">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(event) => setIncludeHeaders(event.target.checked)}
                    className="h-4 w-4 accent-brand"
                  />
                  Include a header row
                </label>
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="rounded-xl bg-brand px-6 py-3 text-[1.1875rem] font-bold text-white transition-colors duration-150 hover:bg-brand-hover"
                >
                  Download all (.zip)
                </button>
              </div>
            </div>

            <div className="mt-6 divide-y divide-line-soft overflow-hidden rounded-2xl border border-line">
              <ResultCard
                title="Elements"
                data={processedData.elements}
                onDownload={() =>
                  downloadElements(processedData.elements, includeHeaders)
                }
              />
              <ResultCard
                title="Chart of Accounts"
                data={processedData.chartOfAccounts}
                onDownload={() =>
                  downloadChartOfAccounts(
                    processedData.chartOfAccounts,
                    includeHeaders
                  )
                }
              />
              <ResultCard
                title="Budget Tracker"
                data={processedData.budgetTracker}
                onDownload={() =>
                  downloadBudgetTracker(
                    processedData.budgetTracker,
                    includeHeaders
                  )
                }
              />
              <ResultCard
                title="Purchase Order"
                data={processedData.purchaseOrder}
                onDownload={() =>
                  downloadPurchaseOrder(
                    processedData.purchaseOrder,
                    includeHeaders
                  )
                }
              />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-line-soft">
        <div className="mx-auto max-w-6xl px-6 py-6 text-base text-ink-faint">
          Built by Flowlyst for West Springfield Public Schools.
        </div>
      </footer>
    </div>
  );
}
