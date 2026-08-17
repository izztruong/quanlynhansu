import { prisma } from '@/config/prisma';
import { BadRequestError } from '@/common/errors';
import type { EmployeeScopeWhere } from '@/common/data-scope';
import type { CheckInInput, ListAttendanceQuery } from './attendance.dto';

const include = {
  employee: { include: { branch: true, department: true } },
  shift: true,
};

function startOfToday() {
  const now = new Date();
  // Build the UTC-midnight instant for *today's local calendar date*, since
  // Prisma normalizes @db.Date columns using the UTC date component — using
  // the local Date constructor here would silently roll back a day for any
  // timezone ahead of UTC (e.g. Asia/Saigon, UTC+7).
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function computeCheckInStatus(shiftStartTime: string | undefined, checkInAt: Date) {
  if (!shiftStartTime) return 'PENDING_APPROVAL' as const;
  const [hour, minute] = shiftStartTime.split(':').map(Number);
  const scheduledStart = new Date(checkInAt);
  scheduledStart.setHours(hour, minute, 0, 0);
  return checkInAt.getTime() > scheduledStart.getTime() ? ('LATE' as const) : ('ON_TIME' as const);
}

export const attendanceService = {
  // Phạm vi để trong AND chứ không trộn chung object `employee`, xem chú
  // thích cùng loại ở schedules.service.ts.
  list(
    { from, to, branchId, departmentId, employeeId }: ListAttendanceQuery,
    scope: EmployeeScopeWhere = {}
  ) {
    return prisma.attendance.findMany({
      where: {
        AND: [
          {
            date: { gte: new Date(from), lte: new Date(to) },
            employeeId: employeeId || undefined,
            employee: {
              branchId: branchId || undefined,
              departmentId: departmentId || undefined,
            },
          },
          scope,
        ],
      },
      include,
      orderBy: { date: 'asc' },
    });
  },

  getTodayForEmployee(employeeId: string) {
    return prisma.attendance.findMany({
      where: { employeeId, date: startOfToday() },
      include,
      orderBy: { checkIn: 'asc' },
    });
  },

  async checkIn(employeeId: string, { shiftId, lat, lng, wifiSsid, wifiBssid }: CheckInInput) {
    const date = startOfToday();
    const openSession = await prisma.attendance.findFirst({
      where: { employeeId, date, checkIn: { not: null }, checkOut: null },
    });
    if (openSession) {
      throw new BadRequestError('Bạn đang trong ca làm, hãy check-out trước khi chấm công vào lần mới');
    }

    const shift = shiftId
      ? await prisma.shift.findUnique({ where: { id: shiftId } })
      : null;
    const checkInAt = new Date();
    const status = computeCheckInStatus(shift?.startTime, checkInAt);

    return prisma.attendance.create({
      data: {
        employeeId,
        date,
        checkIn: checkInAt,
        shiftId: shift?.id,
        status,
        checkInLat: lat,
        checkInLng: lng,
        checkInWifiSsid: wifiSsid,
        checkInWifiBssid: wifiBssid,
      },
      include,
    });
  },

  async checkOut(employeeId: string) {
    const date = startOfToday();
    const openSession = await prisma.attendance.findFirst({
      where: { employeeId, date, checkIn: { not: null }, checkOut: null },
      orderBy: { checkIn: 'desc' },
    });
    if (!openSession) {
      throw new BadRequestError('Bạn chưa chấm công vào');
    }

    return prisma.attendance.update({
      where: { id: openSession.id },
      data: { checkOut: new Date() },
      include,
    });
  },
};
