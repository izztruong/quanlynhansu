import { cn } from '@/lib/utils';
import type { AttendanceStatus, EmployeeStatus, RecordStatus } from '@/types';

const recordStatusMap: Record<RecordStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700' },
  INACTIVE: { label: 'Ngưng hoạt động', className: 'bg-red-50 text-red-600' },
};

const employeeStatusMap: Record<EmployeeStatus, { label: string; className: string }> = {
  WORKING: { label: 'Đang làm việc', className: 'bg-emerald-50 text-emerald-700' },
  TERMINATED: { label: 'Đã nghỉ việc', className: 'bg-gray-100 text-gray-500' },
};

export const attendanceStatusMap: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  ON_TIME: { label: 'Đúng giờ', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  LATE: { label: 'Không đúng giờ', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  MISSED_CHECKIN: { label: 'Quên check-in', className: 'bg-red-50 text-red-600 border-red-200' },
  MISSED_CHECKOUT: { label: 'Quên check-out', className: 'bg-red-50 text-red-600 border-red-200' },
  NOT_YET: { label: 'Chưa đến giờ', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  ON_LEAVE: { label: 'Đã xin nghỉ', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
    >
      {label}
    </span>
  );
}

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  const { label, className } = recordStatusMap[status];
  return <Badge label={label} className={className} />;
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const { label, className } = employeeStatusMap[status];
  return <Badge label={label} className={className} />;
}
