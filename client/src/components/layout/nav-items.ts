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
  ClipboardList,
} from 'lucide-react';

export interface NavChild {
  label: string;
  href: string;
  /** Chức năng tương ứng trong bảng phân quyền; bỏ trống = ai cũng thấy. */
  resource?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
  adminOnly?: boolean;
  resource?: string;
}

export const navItems: NavItem[] = [
  { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { label: 'Nhân viên', href: '/nhan-vien', icon: Users, adminOnly: true, resource: 'EMPLOYEES' },
  {
    label: 'Lịch làm việc',
    icon: CalendarDays,
    children: [
      { label: 'Lịch làm việc theo ca', href: '/lich-lam-viec/theo-ca', resource: 'SCHEDULES' },
      { label: 'Lịch làm việc theo nhân viên', href: '/lich-lam-viec/theo-nhan-vien', resource: 'SCHEDULES' },
    ],
  },
  { label: 'Chấm công', href: '/cham-cong', icon: Clock },
  {
    label: 'Phiếu đánh giá nhân viên',
    href: '/danh-gia',
    icon: ClipboardCheck,
    adminOnly: true,
    resource: 'EVALUATIONS',
  },
  {
    label: 'Phiếu đánh giá nhân viên (Tuần)',
    href: '/danh-gia-tuan',
    icon: ClipboardList,
    adminOnly: true,
    resource: 'WORK_REVIEWS',
  },
  {
    label: 'Truyền thông nội bộ',
    icon: Megaphone,
    children: [
      { label: 'Tin tức', href: '/truyen-thong/tin-tuc', resource: 'NEWS' },
      { label: 'Thông báo', href: '/truyen-thong/thong-bao', resource: 'NOTIFICATIONS' },
    ],
  },
  { label: 'Lương', href: '/luong', icon: Wallet },
  { label: 'Cấu hình lương', href: '/cau-hinh-luong', icon: SlidersHorizontal, adminOnly: true },
  {
    label: 'Danh mục',
    icon: Grid2x2,
    adminOnly: true,
    children: [
      { label: 'Chi nhánh', href: '/danh-muc/chi-nhanh', resource: 'BRANCHES' },
      { label: 'Bộ phận', href: '/danh-muc/bo-phan', resource: 'DEPARTMENTS' },
      { label: 'Ca làm việc', href: '/danh-muc/ca-lam-viec', resource: 'SHIFTS' },
      { label: 'Chức vụ', href: '/danh-muc/chuc-vu', resource: 'POSITIONS' },
      { label: 'Level', href: '/danh-muc/level', resource: 'LEVELS' },
      {
        label: 'Cấu hình phiếu đánh giá',
        href: '/danh-muc/tieu-chi-danh-gia',
        resource: 'EVALUATION_CRITERIA',
      },
      {
        label: 'Cấu hình học việc',
        href: '/danh-muc/tieu-chi-hoc-viec',
        resource: 'TRAINING_CRITERIA',
      },
      {
        label: 'Cấu hình đánh giá tuần',
        href: '/danh-muc/cau-hinh-danh-gia-tuan',
        resource: 'WORK_REVIEW_SECTIONS',
      },
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
