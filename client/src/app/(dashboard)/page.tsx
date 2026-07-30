'use client';

import { useCallback, useEffect, useState } from 'react';
import { RotateCw, Users2 } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { api } from '@/lib/api-client';
import { toISODate, formatShortDate } from '@/lib/date';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { attendanceStatusMap } from '@/components/ui/status-badge';
import type { Attendance, Branch, Schedule } from '@/types';

function StatBox({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className={`text-2xl font-semibold ${tone ?? ''}`}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function TongQuanPage() {
  usePageTitle('Tổng quan hôm nay');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState('all');
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: date, to: date });
      if (branchId !== 'all') params.set('branchId', branchId);
      const [scheduleData, attendanceData] = await Promise.all([
        api.get<Schedule[]>(`/schedules?${params.toString()}`),
        api.get<Attendance[]>(`/attendance?${params.toString()}`),
      ]);
      setSchedules(scheduleData);
      setAttendance(attendanceData);
    } finally {
      setLoading(false);
    }
  }, [branchId, date]);

  useEffect(() => {
    load();
  }, [load]);

  const shiftGroups = schedules.reduce<Record<string, { name: string; time: string; entries: Schedule[] }>>(
    (acc, s) => {
      const key = s.shift.id;
      if (!acc[key]) {
        acc[key] = {
          name: s.shift.name,
          time: `${s.shift.startTime}-${s.shift.endTime}`,
          entries: [],
        };
      }
      acc[key].entries.push(s);
      return acc;
    },
    {}
  );

  const checkedInCount = attendance.filter((a) => a.checkIn).length;
  const lateCount = attendance.filter((a) => a.status === 'LATE').length;
  const missedCheckinCount = attendance.filter((a) => a.status === 'MISSED_CHECKIN').length;
  const missedCheckoutCount = attendance.filter((a) => a.status === 'MISSED_CHECKOUT').length;
  const onLeaveCount = attendance.filter((a) => a.status === 'ON_LEAVE').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SimpleSelect
          value={branchId}
          onValueChange={setBranchId}
          className="w-64"
          options={[
            { value: 'all', label: 'Tất cả chi nhánh' },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-44"
        />
        <Button onClick={load}>Lọc</Button>
        <Button variant="outline" size="icon" onClick={() => setDate(toISODate(new Date()))}>
          <RotateCw className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-gradient-to-br from-sky-50 to-blue-100 p-6 lg:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">Tổng ca làm việc</p>
          <p className="mt-1 text-4xl font-bold text-blue-900">{Object.keys(shiftGroups).length}</p>
          <div className="mt-4 flex gap-8 text-sm">
            <p>
              <span className="font-semibold">{schedules.length}</span> Nhân viên được xếp lịch
            </p>
            <p>
              <span className="font-semibold">{checkedInCount}</span> Nhân viên đã chấm công
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-bold">0đ</p>
              <p className="text-xs text-blue-100">Tổng lương ngày dự kiến</p>
            </div>
            <div>
              <p className="text-xl font-bold">0đ</p>
              <p className="text-xs text-blue-100">Tổng lương ngày tới thời điểm hiện tại</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatBox value={lateCount} label="Đi muộn" tone="text-red-600" />
        <StatBox value={0} label="Về sớm" />
        <StatBox value={missedCheckinCount} label="Quên check-in" />
        <StatBox value={missedCheckoutCount} label="Quên check-out" />
        <StatBox value={onLeaveCount} label="Nghỉ phép" />
        <StatBox value={0} label="Nghỉ không phép" />
        <StatBox value={0} label="Ca phát sinh so với kế hoạch" />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <p className="font-medium">Danh sách ca làm việc ngày {formatShortDate(new Date(date))}</p>
        </div>
        <div className="divide-y">
          {loading && <p className="p-6 text-center text-sm text-muted-foreground">Đang tải...</p>}
          {!loading && Object.keys(shiftGroups).length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Không có ca làm việc nào trong ngày này
            </p>
          )}
          {Object.values(shiftGroups).map((group) => (
            <div key={group.name} className="p-4">
              <p className="mb-3 text-sm font-semibold">
                {group.name} [{group.time}]
              </p>
              <div className="space-y-2">
                {group.entries.map((entry) => {
                  const record = attendance.find((a) => a.employee.id === entry.employee.id);
                  return (
                    <div key={entry.id} className="flex items-center gap-3 rounded-md bg-muted/40 p-2.5">
                      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        <Users2 className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.employee.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.employee.department.name}</p>
                      </div>
                      <p className="text-xs font-medium">
                        {record
                          ? attendanceStatusMap[record.status].label
                          : 'Chưa đến giờ'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
