'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { PageTitleProvider } from './page-title-context';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <PageTitleProvider>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar className="hidden lg:flex" />

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <Sidebar className={cn('absolute inset-y-0 left-0 z-50 flex')} />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onToggleSidebar={() => setMobileOpen((v) => !v)} />
          <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
