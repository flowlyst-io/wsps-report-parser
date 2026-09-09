'use client';

import { useCallback, useId, useState } from 'react';

interface ResultCardProps<T extends object> {
  title: string;
  data: T[];
  onDownload: () => void;
  previewLimit?: number;
}

export default function ResultCard<T extends object>({
  title,
  data,
  onDownload,
  previewLimit = 20,
}: ResultCardProps<T>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [scrollsSideways, setScrollsSideways] = useState(false);
  const tableId = useId();

  // Only claim the table scrolls sideways when it really does. The observer
  // fires once when it starts watching, and again whenever the width changes.
  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver(() =>
      setScrollsSideways(node.scrollWidth > node.clientWidth + 1)
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const totalRows = data.length;
  const isEmpty = totalRows === 0;
  const columns = isEmpty ? [] : (Object.keys(data[0]) as (keyof T & string)[]);
  const previewData = data.slice(0, previewLimit);

  return (
    <section className="px-6 py-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isEmpty}
          aria-expanded={isEmpty ? undefined : isExpanded}
          aria-controls={isEmpty ? undefined : tableId}
          className="flex items-center gap-3 text-left disabled:cursor-default"
        >
          {!isEmpty && (
            <svg
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-150 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          )}
          <span>
            <span className="block text-xl font-bold text-ink">{title}</span>
            <span
              className={`block text-base ${
                isEmpty ? 'text-danger' : 'text-ink-soft'
              }`}
            >
              {isEmpty
                ? 'No rows — check the file you uploaded'
                : `${totalRows.toLocaleString()} ${totalRows === 1 ? 'row' : 'rows'}`}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={isEmpty}
          className="rounded-xl border border-line bg-white px-5 py-2.5 text-base font-bold text-ink transition-colors duration-150 hover:border-ink-faint hover:bg-brand-tint disabled:cursor-not-allowed disabled:border-line-soft disabled:text-ink-faint disabled:hover:bg-white"
        >
          Download CSV
        </button>
      </div>

      {!isEmpty && isExpanded && (
        <div id={tableId} className="mt-4">
          {/* One scroll container, so wide tables scroll sideways instead of
              clipping, and the sticky header still works. */}
          <div
            ref={scrollRef}
            className="max-h-96 overflow-auto rounded-xl border border-line-soft"
          >
            <table className="w-full border-collapse text-base">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="sticky top-0 z-10 whitespace-nowrap border-b border-line bg-white px-4 py-3 text-left font-bold text-ink"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border-b border-line-soft last:border-0">
                      {columns.map((column) => {
                        const value = row[column];
                        const isNumber = typeof value === 'number';
                        return (
                          <td
                            key={column}
                            className={`whitespace-nowrap px-4 py-2.5 text-ink-soft ${
                              isNumber ? 'text-right tabular-nums' : ''
                            }`}
                          >
                            {/* Shown exactly as it is written to the CSV, so the
                                preview and the download always agree. */}
                            {String(value ?? '')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

          <p className="mt-2.5 text-base text-ink-faint">
            {totalRows > previewLimit
              ? `Showing the first ${previewLimit} of ${totalRows.toLocaleString()} rows. The download has all of them.`
              : `Showing ${totalRows === 1 ? 'the only row' : `all ${totalRows.toLocaleString()} rows`}.`}
            {scrollsSideways && ' Scroll sideways for the rest of the columns.'}
          </p>
        </div>
      )}
    </section>
  );
}
