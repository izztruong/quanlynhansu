import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Megaphone,
  Wallet,
  SlidersHorizontal,
  Grid2x2,
  Settings,
  ClipboardCheck,
} from 'lucide-react';

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { label: 'Nhân viên', href: '/nhan-vien', icon: Users, adminOnly: true },
  {
    label: 'Lịch làm việc',
    icon: CalendarDays,
    children: [
      { label: 'Lịch làm việc theo ca', href: '/lich-lam-viec/theo-ca' },
      { label: 'Lịch làm việc theo nhân viên', href: '/lich-lam-viec/theo-nhan-vien' },
    ],
  },
  { label: 'Chấm công', href: '/cham-cong', icon: Clock },
  { label: 'Phiếu đánh giá nhân viên', href: '/danh-gia', icon: ClipboardCheck, adminOnly: true },
  {
    label: 'Truyền thông nội bộ',
    icon: Megaphone,
    children: [
      { label: 'Tin tức', href: '/truyen-thong/tin-tuc' },
      { label: 'Thông báo', href: '/truyen-thong/thong-bao' },
    ],
  },
  { label: 'Lương', href: '/luong', icon: Wallet },
  { label: 'Cấu hình lương', href: '/cau-hinh-luong', icon: SlidersHorizontal, adminOnly: true },
  {
    label: 'Danh mục',
    icon: Grid2x2,
    adminOnly: true,
    children: [
      { label: 'Chi nhánh', href: '/danh-muc/chi-nhanh' },
      { label: 'Bộ phận', href: '/danh-muc/bo-phan' },
      { label: 'Ca làm việc', href: '/danh-muc/ca-lam-viec' },
      { label: 'Chức vụ', href: '/danh-muc/chuc-vu' },
      { label: 'Level', href: '/danh-muc/level' },
      { label: 'Cấu hình phiếu đánh giá', href: '/danh-muc/tieu-chi-danh-gia' },
    ],
  },
  { label: 'Cài đặt', href: '/cai-dat', icon: Settings, adminOnly: true },
];

export function isAdminRoute(pathname: string): boolean {
  return navItems.some((item) => {
    if (item.href) {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      return matches && !!item.adminOnly;
    }
    if (item.children) {
      const matches = item.children.some(
        (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
      );
      return matches && !!item.adminOnly;
    }
    return false;
  });
}
