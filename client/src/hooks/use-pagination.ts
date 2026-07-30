'use client';

import { useEffect, useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 20;

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);

  // Jump back to page 1 whenever the underlying list shrinks/grows (a search
  // or filter changed) — landing on a now-unrelated page would be confusing.
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  return {
    page: safePage,
    setPage,
    pageCount,
    pageItems,
    pageSize,
    totalCount: items.length,
    startIndex: (safePage - 1) * pageSize,
  };
}
