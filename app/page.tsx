'use client';

import { useState, useCallback } from 'react';
import UploadZone from '@/components/UploadZone';
import ResultCard from '@/components/ResultCard';
import { parseCSV, validateFile } from '@/lib/csvParser';
import { transformToFormattedData } from '@/lib/dataTransformer';
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

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>();
  const [rowCount, setRowCount] = useState<number>();
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Reset state
    setError(null);
    setProcessedData(null);
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

      // Parse CSV
      const parseResult = await parseCSV(file);

      if (parseResult.errors.length > 0) {
        setError(parseResult.errors.join('; '));
        setIsProcessing(false);
        return;
      }

      setRowCount(parseResult.data.length);

      // Transform data
      const formattedData = transformToFormattedData(parseResult.data);

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
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
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
      processedData.purchaseOrder
    );
  }, [processedData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                WSPS Detailed Expenditure Report Parser
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Powered by Flowlyst
              </p>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              v1.0
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <UploadZone
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            error={error}
            fileName={fileName}
            rowCount={rowCount}
          />
        </div>

        {/* Results Section */}
        {processedData && (
          <div className="space-y-6">
            {/* Download All Button */}
            <div className="flex justify-end">
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Download All (.zip)
              </button>
            </div>

            {/* Result Cards */}
            <div className="space-y-4">
              <ResultCard
                title="Elements"
                data={processedData.elements}
                onDownload={() => downloadElements(processedData.elements)}
              />

              <ResultCard
                title="Chart of Accounts"
                data={processedData.chartOfAccounts}
                onDownload={() =>
                  downloadChartOfAccounts(processedData.chartOfAccounts)
                }
              />

              <ResultCard
                title="Budget Tracker"
                data={processedData.budgetTracker}
                onDownload={() => downloadBudgetTracker(processedData.budgetTracker)}
              />

              <ResultCard
                title="Purchase Order"
                data={processedData.purchaseOrder}
                onDownload={() => downloadPurchaseOrder(processedData.purchaseOrder)}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        {!processedData && !isProcessing && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              How to use:
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Export the Detailed Expenditure Report from your ERP system as a CSV file</li>
              <li>Upload the CSV file using the drop zone above</li>
              <li>Wait for processing to complete (typically 2-5 seconds)</li>
              <li>Review the generated datasets in the preview tables</li>
              <li>Download individual datasets or all datasets as a ZIP file</li>
            </ol>
            <p className="text-sm text-blue-700 mt-4">
              All processing happens locally in your browser. No data is sent to any server.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2025 Flowlyst. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
