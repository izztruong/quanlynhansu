'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { navItems, type NavItem } from './nav-items';

function isChildActive(item: NavItem, pathname: string) {
  return item.children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`)) ?? false;
}

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const childActive = isChildActive(item, pathname);
  const [expanded, setExpanded] = useState(childActive);

  useEffect(() => {
    if (childActive) setExpanded(true);
  }, [childActive]);

  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
          childActive && 'text-sidebar-primary font-semibold'
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-sidebar-border pl-4">
          {item.children!.map((child) => {
            const active = pathname === child.href || pathname.startsWith(`${child.href}/`);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
                  active && 'bg-sidebar-accent text-sidebar-primary font-medium'
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground',
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-white/10 bg-sidebar-primary px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-white text-sm font-bold text-sidebar-primary">
          H
        </div>
        <span className="text-lg font-bold tracking-wide text-white">HRM</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          if (item.children) {
            return <NavGroup key={item.label} item={item} pathname={pathname} />;
          }

          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
                active && 'bg-sidebar-primary text-white hover:bg-sidebar-primary'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
