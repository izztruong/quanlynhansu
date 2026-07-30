'use client';

import { useRouter } from 'next/navigation';
import { Menu, Bell, UserRound, LogOut, IdCard, ShieldCheck } from 'lucide-react';
import { useHeaderTitle } from './page-title-context';
import { useAuth } from '@/lib/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const title = useHeaderTitle();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-sidebar-primary px-4 text-white">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md p-2 hover:bg-white/10 lg:hidden"
        aria-label="Đóng/mở menu"
      >
        <Menu className="size-5" />
      </button>
      <h1 className="text-base font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-white hover:bg-white/10"
          aria-label="Thông báo"
        >
          <Bell className="size-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-white/10">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white">
              <UserRound className="size-4" />
            </span>
            {user && <span className="hidden text-sm font-medium sm:inline">{user.name}</span>}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && (
              <>
                <div className="px-1.5 py-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            {user && (
              <>
                <DropdownMenuItem onClick={() => router.push(`/nhan-vien/${user.id}`)}>
                  <IdCard className="size-4" />
                  Thông tin cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/bao-mat')}>
                  <ShieldCheck className="size-4" />
                  Bảo mật tài khoản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="size-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
