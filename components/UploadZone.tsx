'use client';

import { useCallback, useId, useState } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
  fileName?: string;
  rowCount?: number;
  /** True once the four datasets exist, so the picker collapses out of the way. */
  isComplete?: boolean;
}

export default function UploadZone({
  onFileSelect,
  isProcessing,
  error,
  fileName,
  rowCount,
  isComplete = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      // Let the same file be chosen twice in a row.
      e.target.value = '';
    },
    [onFileSelect]
  );

  const fileInput = (
    <input
      id={inputId}
      type="file"
      accept=".csv,text/csv"
      onChange={handleFileInput}
      className="sr-only"
      disabled={isProcessing}
    />
  );

  // Once the datasets are on screen, the picker shrinks to a single line so the
  // results are what you see first.
  if (isComplete) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-2xl border px-5 py-4 transition-colors duration-150 ${
          isDragging ? 'border-brand bg-brand-tint' : 'border-line bg-brand-tint'
        }`}
      >
        <p className="flex items-center gap-3">
          <svg
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-brand"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
          <span className="text-base">
            <span className="font-bold text-ink">{fileName}</span>
            {rowCount !== undefined && (
              <span className="text-ink">
                {' '}
                — {rowCount.toLocaleString()} {rowCount === 1 ? 'row' : 'rows'}{' '}
                read
              </span>
            )}
          </span>
        </p>
        {/* The input sits inside the label so the label can show the keyboard
            focus. A <label> never matches :focus-visible on its own, and the
            input itself is clipped to nothing by sr-only. */}
        <label className="cursor-pointer rounded-xl border border-line bg-white px-4 py-2 text-base font-bold text-ink transition-colors duration-150 hover:border-ink-faint has-[input:focus-visible]:border-brand has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-brand">
          {fileInput}
          Use a different file
        </label>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* The file input is visually hidden, so its own focus ring would be
          clipped away. The panel carries the focus state instead. */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-3xl border-2 border-dashed px-6 py-12 text-center
          transition-colors duration-150
          ${
            isDragging
              ? 'border-brand bg-brand-tint'
              : 'border-line bg-white hover:border-ink-faint'
          }
          has-[input:focus-visible]:border-brand has-[input:focus-visible]:bg-brand-tint
          ${isProcessing ? 'pointer-events-none' : ''}
        `}
      >
        {fileInput}

        <div className="flex flex-col items-center gap-5">
          <span
            aria-hidden="true"
            className={`
              flex h-16 w-16 items-center justify-center rounded-2xl
              transition-colors duration-150
              ${isProcessing ? 'bg-accent' : 'bg-brand'}
            `}
          >
            {isProcessing ? (
              <svg
                className="h-7 w-7 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeOpacity="0.3"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                className="h-7 w-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4" />
                <path d="M7 9l5-5 5 5" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            )}
          </span>

          <div className="space-y-1.5">
            <p className="text-2xl font-bold text-ink">
              {isProcessing ? 'Reading your file…' : 'Drop your CSV here'}
            </p>
            <p className="text-base text-ink-soft">
              {isProcessing
                ? 'This takes a few seconds.'
                : 'or choose a file from your computer'}
            </p>
          </div>
        </div>

        {/* The whole panel is one target: drop on it, click it, or tab to it. */}
        {!isProcessing && (
          <label
            htmlFor={inputId}
            className="absolute inset-0 cursor-pointer rounded-3xl"
          >
            <span className="sr-only">
              Upload the WSPS Detailed Expenditure Report CSV
            </span>
          </label>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-danger/30 bg-danger-tint px-5 py-4"
        >
          <p className="font-bold text-danger">
            {fileName ? `${fileName} could not be used` : 'That file could not be used'}
          </p>
          <p className="mt-1 break-words text-base text-ink">{error}</p>
        </div>
      )}
    </div>
  );
}
