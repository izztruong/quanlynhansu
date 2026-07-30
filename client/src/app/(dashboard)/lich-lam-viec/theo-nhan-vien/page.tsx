'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { api } from '@/lib/api-client';
import { getWeekDates, toISODate } from '@/lib/date';
import { WeekFilterBar } from '@/components/features/lich-lam-viec/week-filter-bar';
import { WeekGrid } from '@/components/features/lich-lam-viec/week-grid';
import { AssignDialog } from '@/components/features/lich-lam-viec/assign-dialog';
import type { Branch, Department, Employee, Schedule, Shift } from '@/types';

export default function LichLamViecTheoNhanVienPage() {
  usePageTitle('Lịch làm việc theo nhân viên');

  const [referenceDate, setReferenceDate] = useState(new Date());
  const [branchId, setBranchId] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<{ employeeId: string; date: string } | null>(
    null
  );

  const weekDates = getWeekDates(referenceDate);

  const visibleEmployees = employees.filter(
    (e) =>
      (branchId === 'all' || e.branch.id === branchId) &&
      (departmentId === 'all' || e.department.id === departmentId)
  );

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: toISODate(weekDates[0]),
        to: toISODate(weekDates[6]),
      });
      if (branchId !== 'all') params.set('branchId', branchId);
      if (departmentId !== 'all') params.set('departmentId', departmentId);
      const data = await api.get<Schedule[]>(`/schedules?${params.toString()}`);
      setSchedules(data);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, departmentId, toISODate(weekDates[0])]);

  useEffect(() => {
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
    api.get<Shift[]>('/shifts').then(setShifts).catch(() => {});
    api.get<Employee[]>('/employees').then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

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
        onRefresh={loadSchedules}
      />

      <WeekGrid
        rows={visibleEmployees}
        loading={loading}
        weekDates={weekDates}
        getRowKey={(employee) => employee.id}
        renderRowLabel={(employee) => {
          const total = schedules.filter((s) => s.employee.id === employee.id);
          const totalHours = total.reduce((sum, s) => {
            const [sh, sm] = s.shift.startTime.split(':').map(Number);
            const [eh, em] = s.shift.endTime.split(':').map(Number);
            return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
          }, 0);
          return (
            <div>
              <p className="font-medium">{employee.name}</p>
              <p className="text-xs text-muted-foreground">
                {total.length} ca | {totalHours} giờ
              </p>
            </div>
          );
        }}
        renderCell={(employee, date) => {
          const iso = toISODate(date);
          const entries = schedules.filter(
            (s) => s.employee.id === employee.id && s.date.slice(0, 10) === iso
          );
          return (
            <div className="flex flex-col gap-1.5">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="truncate rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                  title={`${entry.shift.name} [${entry.shift.startTime}-${entry.shift.endTime}]`}
                >
                  {entry.shift.name}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAssignTarget({ employeeId: employee.id, date: iso })}
                className="flex items-center justify-center rounded-md border border-dashed py-1.5 text-muted-foreground hover:bg-muted"
              >
                <Plus className="size-4" />
              </button>
            </div>
          );
        }}
      />

      <AssignDialog
        open={!!assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        title="Xếp lịch làm việc"
        label="Ca làm việc"
        options={shifts.map((s) => ({ id: s.id, label: `${s.name} [${s.startTime}-${s.endTime}]` }))}
        onSubmit={async (shiftId) => {
          if (!assignTarget) return;
          await api.post('/schedules', {
            employeeId: assignTarget.employeeId,
            shiftId,
            date: assignTarget.date,
          });
          setAssignTarget(null);
          await loadSchedules();
        }}
      />
    </div>
  );
}
