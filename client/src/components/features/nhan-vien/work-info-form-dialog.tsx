'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import type { Employee } from '@/types';

interface FormState {
  capabilitySalary: string;
  workedHours: string;
}

function toFormState(employee: Employee): FormState {
  return {
    capabilitySalary: employee.capabilitySalary?.toString() ?? '',
    workedHours: employee.workedHours?.toString() ?? '',
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onChanged: () => void;
}

export function WorkInfoFormDialog({ open, onOpenChange, employee, onChanged }: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(employee));

  useEffect(() => {
    if (open) setForm(toFormState(employee));
  }, [open, employee]);

  const handleSubmit = async () => {
    await api.put(`/employees/${employee.id}`, {
      capabilitySalary: form.capabilitySalary === '' ? undefined : Number(form.capabilitySalary),
      workedHours: form.workedHours === '' ? undefined : Number(form.workedHours),
    });
    toast.success('Đã cập nhật thông tin công việc');
    onChanged();
  };

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sửa thông tin công việc"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <Label htmlFor="work-capability-salary">Lương năng lực (VNĐ)</Label>
        <Input
          id="work-capability-salary"
          type="number"
          value={form.capabilitySalary}
          onChange={(e) => setForm((f) => ({ ...f, capabilitySalary: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="work-worked-hours">Số giờ đã làm</Label>
        <Input
          id="work-worked-hours"
          type="number"
          step="any"
          value={form.workedHours}
          onChange={(e) => setForm((f) => ({ ...f, workedHours: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">Cho phép số lẻ, ví dụ 160.5 giờ.</p>
      </div>
    </CrudFormDialog>
  );
}
