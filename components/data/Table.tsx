"use client";

import React from "react";

type SortDir = "asc" | "desc";

export type Column<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
};

export interface TableProps<T> {
  columns: Array<Column<T>>;
  data: T[];
  initialSort?: { key: string; direction: SortDir };
  pagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  emptyMessage?: string;
}

function compare(a: unknown, b: unknown, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return -1 * mul;
  if (b == null) return 1 * mul;

  // Try to compare numbers
  const na = typeof a === "number" ? a : Number.isNaN(Number(a)) ? null : Number(a);
  const nb = typeof b === "number" ? b : Number.isNaN(Number(b)) ? null : Number(b);
  if (na !== null && nb !== null) {
    return na < nb ? -1 * mul : na > nb ? 1 * mul : 0;
  }

  // Fallback string comparison
  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  if (sa < sb) return -1 * mul;
  if (sa > sb) return 1 * mul;
  return 0;
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  initialSort,
  pagination = true,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20],
  className,
  emptyMessage = "No data available.",
}: TableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(initialSort?.key ?? null);
  const [sortDir, setSortDir] = React.useState<SortDir>(initialSort?.direction ?? "asc");
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [page, setPage] = React.useState(1);

  const onHeaderClick = (col: Column<T>) => {
    const key = String(col.key);
    if (!col.sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = React.useMemo(() => {
    if (!sortKey) return data;
    const key = sortKey as keyof T;
    return [...data].sort((ra, rb) => compare(ra[key], rb[key], sortDir));
  }, [data, sortKey, sortDir]);

  const total = sorted.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, lastPage);

  const paginated = React.useMemo(() => {
    if (!pagination) return sorted;
    const start = (clampedPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  }, [sorted, pagination, clampedPage, pageSize]);

  React.useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  return (
    <div className={["w-full overflow-x-auto", className || ""].filter(Boolean).join(" ")}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-slate-600 text-sm">
            {columns.map((col) => {
              const isSorted = sortKey === String(col.key);
              const dir = isSorted ? sortDir : undefined;
              return (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={[
                    "px-3 py-2 font-semibold select-none",
                    col.sortable ? "cursor-pointer hover:bg-gray-50" : "",
                    col.className || "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onHeaderClick(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable ? (
                      <span aria-hidden className="inline-flex">
                        {!isSorted ? (
                          <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 7l3-3 3 3H7zM13 13l-3 3-3-3h6z" />
                          </svg>
                        ) : dir === "asc" ? (
                          <svg className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 13l3-3 3 3H7z" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 7l3 3 3-3H7z" />
                          </svg>
                        )}
                      </span>
                    ) : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="text-sm">
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginated.map((row, idx) => (
              <tr
                key={idx}
                className="border-b last:border-b-0 border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                {columns.map((col) => {
                  const content =
                    typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row as any)[col.key as any] as React.ReactNode;
                  return (
                    <td key={String(col.key)} className="px-3 py-2 text-slate-800">
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination ? (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <div className="inline-flex items-center gap-2">
            <span>Rows per page</span>
            <select
              className="h-9 rounded-md border border-gray-300 bg-white px-2"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="inline-flex items-center gap-3">
            <span>
              Page {clampedPage} of {lastPage}
            </span>
            <div className="inline-flex items-center gap-1">
              <button
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={clampedPage === 1}
                aria-label="First page"
              >
                «
              </button>
              <button
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={clampedPage === 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              <button
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={clampedPage === lastPage}
                aria-label="Next page"
              >
                ›
              </button>
              <button
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage(lastPage)}
                disabled={clampedPage === lastPage}
                aria-label="Last page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}