'use client';

import { useState } from 'react';

interface ResultCardProps {
  title: string;
  data: Record<string, unknown>[];
  onDownload: () => void;
  previewLimit?: number;
}

export default function ResultCard({
  title,
  data,
  onDownload,
  previewLimit = 20,
}: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const previewData = data.slice(0, previewLimit);
  const totalRows = data.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalRows.toLocaleString()} rows
            </p>
          </div>
        </button>

        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download CSV
        </button>
      </div>

      {/* Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="px-4 py-3 text-gray-600 whitespace-nowrap"
                      >
                        {String(row[column] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalRows > previewLimit && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Showing first {previewLimit} of {totalRows.toLocaleString()} rows
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
