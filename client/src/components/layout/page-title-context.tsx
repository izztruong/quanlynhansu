'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface PageTitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Tổng quan');
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle(title: string) {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error('usePageTitle phải dùng trong PageTitleProvider');
  useEffect(() => {
    ctx.setTitle(title);
  }, [title]);
}

export function useHeaderTitle() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error('useHeaderTitle phải dùng trong PageTitleProvider');
  return ctx.title;
}
