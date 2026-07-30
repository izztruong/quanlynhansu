'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { api } from '@/lib/api-client';
import { getWeekDates, toISODate } from '@/lib/date';
import { WeekFilterBar } from '@/components/features/lich-lam-viec/week-filter-bar';
import { WeekGrid } from '@/components/features/lich-lam-viec/week-grid';
import { attendanceStatusMap } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import type { Attendance, Branch, Department, Employee } from '@/types';

function formatTime(value: string | null) {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChamCongPage() {
  usePageTitle('Chấm công');

  const [referenceDate, setReferenceDate] = useState(new Date());
  const [branchId, setBranchId] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates(referenceDate);

  const visibleEmployees = employees.filter(
    (e) =>
      (branchId === 'all' || e.branch.id === branchId) &&
      (departmentId === 'all' || e.department.id === departmentId)
  );

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: toISODate(weekDates[0]),
        to: toISODate(weekDates[6]),
      });
      if (branchId !== 'all') params.set('branchId', branchId);
      if (departmentId !== 'all') params.set('departmentId', departmentId);
      const data = await api.get<Attendance[]>(`/attendance?${params.toString()}`);
      setAttendance(data);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, departmentId, toISODate(weekDates[0])]);

  useEffect(() => {
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
    api.get<Employee[]>('/employees').then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  return (
    <div className="space-y-4">
      <WeekFilterBar
        referenceDate={referenceDate}
        onReferenceDateChange={setReferenceDate}
        branchId={branchId}
        onBranchIdChange={setBranchId}
        branches={branches}
        departmentId={departmentId}
        onDepartmentIdChange={setDepartmentId}
        departments={departments}
        onRefresh={loadAttendance}
      />

      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-2.5 text-xs">
        {Object.entries(attendanceStatusMap).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-full border', value.className)} />
            {value.label}
          </div>
        ))}
      </div>

      <WeekGrid
        rows={visibleEmployees}
        loading={loading}
        weekDates={weekDates}
        getRowKey={(employee) => employee.id}
        renderRowLabel={(employee) => (
          <div>
            <p className="font-medium text-primary">{employee.name}</p>
            <p className="text-xs text-muted-foreground">{employee.code}</p>
          </div>
        )}
        renderCell={(employee, date) => {
          const iso = toISODate(date);
          const records = attendance.filter(
            (a) => a.employee.id === employee.id && a.date.slice(0, 10) === iso
          );
          if (records.length === 0) {
            return <div className="h-9 rounded-md border border-dashed" />;
          }
          return (
            <div className="flex flex-col gap-1">
              {records.map((record) => {
                const status = attendanceStatusMap[record.status];
                return (
                  <div
                    key={record.id}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md border text-xs font-medium',
                      status.className
                    )}
                    title={status.label}
                  >
                    {formatTime(record.checkIn)} - {formatTime(record.checkOut)}
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
