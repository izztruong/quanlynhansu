'use client';

import type { ReactNode } from 'react';
import { formatDayLabel, isSameDate } from '@/lib/date';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';

interface WeekGridProps<R> {
  rows: R[];
  getRowKey: (row: R) => string;
  renderRowLabel: (row: R) => ReactNode;
  weekDates: Date[];
  renderCell: (row: R, date: Date) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  labelColWidth?: number;
}

export function WeekGrid<R>({
  rows,
  getRowKey,
  renderRowLabel,
  weekDates,
  renderCell,
  loading,
  emptyMessage = 'Chưa có dữ liệu',
  labelColWidth = 220,
}: WeekGridProps<R>) {
  const today = new Date();
  const { page, setPage, pageCount, pageItems: pageRows, totalCount } = usePagination(rows);

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col style={{ width: labelColWidth }} />
            {weekDates.map((d) => (
              <col key={d.toISOString()} style={{ width: 180 }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-muted/40">
              <th
                className="sticky left-0 z-10 border border-border bg-muted/40 p-3 text-left font-medium"
                style={{ left: 0 }}
              >
                &nbsp;
              </th>
              {weekDates.map((date) => (
                <th
                  key={date.toISOString()}
                  className="border border-border p-3 text-left font-medium data-[today=true]:text-primary"
                  data-today={isSameDate(date, today)}
                >
                  {formatDayLabel(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={weekDates.length + 1}
                  className="h-24 border border-border text-center text-muted-foreground"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
            {!loading && totalCount === 0 && (
              <tr>
                <td
                  colSpan={weekDates.length + 1}
                  className="h-24 border border-border text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              pageRows.map((row) => (
                <tr key={getRowKey(row)}>
                  <td
                    className="sticky left-0 z-10 border border-border bg-card p-3 align-top"
                    style={{ left: 0 }}
                  >
                    {renderRowLabel(row)}
                  </td>
                  {weekDates.map((date) => (
                    <td key={date.toISOString()} className="border border-border p-2 align-top">
                      {renderCell(row, date)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalCount={totalCount} />
      )}
    </div>
  );
}
