'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { selectablePositions } from '@/lib/position-utils';
import { activeOnly } from '@/lib/record-utils';
import type { Branch, Department, Level, Position } from '@/types';

interface FormState {
  code: string;
  name: string;
  email: string;
  phone: string;
  branchId: string;
  departmentId: string;
  positionId: string;
  levelId: string;
  employeeType: 'FULL_TIME' | 'PART_TIME';
  salaryRate: string;
  capabilitySalary: string;
  workedHours: string;
}

const emptyForm: FormState = {
  code: '',
  name: '',
  email: '',
  phone: '',
  branchId: '',
  departmentId: '',
  positionId: '',
  levelId: 'none',
  employeeType: 'FULL_TIME',
  salaryRate: '',
  capabilitySalary: '',
  workedHours: '',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  departments: Department[];
  positions: Position[];
  levels: Level[];
  onSubmit: (input: unknown) => Promise<void>;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  branches,
  departments,
  positions,
  levels,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        branchId: activeOnly(branches)[0]?.id ?? '',
        departmentId: activeOnly(departments)[0]?.id ?? '',
        positionId: selectablePositions(positions)[0]?.id ?? '',
      });
    }
  }, [open, branches, departments, positions]);

  const handleSubmit = async () => {
    await onSubmit({
      code: form.code,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      branchId: form.branchId,
      departmentId: form.departmentId,
      positionId: form.positionId,
      levelId: form.levelId === 'none' ? undefined : form.levelId,
      employeeType: form.employeeType,
      salaryRate: form.salaryRate === '' ? undefined : Number(form.salaryRate),
      capabilitySalary: form.capabilitySalary === '' ? undefined : Number(form.capabilitySalary),
      workedHours: form.workedHours === '' ? undefined : Number(form.workedHours),
    });
    if (form.email) {
      toast.info('Đã cấp tài khoản đăng nhập — mật khẩu mặc định: 123456');
    }
  };

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thêm nhân viên"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code">Mã nhân viên</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Họ và tên</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="nhanvien@congty.com"
        />
        <p className="text-xs text-muted-foreground">
          Để trống nếu nhân viên chưa cần tài khoản đăng nhập. Có email, hệ thống tự cấp mật khẩu
          mặc định <span className="font-medium">123456</span> — nhân viên tự đổi sau tại "Bảo mật
          tài khoản".
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Chi nhánh</Label>
          <SimpleSelect
            value={form.branchId}
            onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}
            options={activeOnly(branches).map((b) => ({ value: b.id, label: b.name }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Bộ phận</Label>
          <SimpleSelect
            value={form.departmentId}
            onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}
            options={activeOnly(departments).map((d) => ({ value: d.id, label: d.name }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Chức vụ</Label>
          <SimpleSelect
            value={form.positionId}
            onValueChange={(v) => setForm((f) => ({ ...f, positionId: v }))}
            options={selectablePositions(positions).map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Level</Label>
          <SimpleSelect
            value={form.levelId}
            onValueChange={(v) => setForm((f) => ({ ...f, levelId: v }))}
            options={[
              { value: 'none', label: 'Chưa xếp level' },
              ...activeOnly(levels).map((l) => ({ value: l.id, label: l.name })),
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Loại nhân viên</Label>
          <SimpleSelect
            value={form.employeeType}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, employeeType: v as FormState['employeeType'] }))
            }
            options={[
              { value: 'FULL_TIME', label: 'Full-time' },
              { value: 'PART_TIME', label: 'Part-time' },
            ]}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="salaryRate">
            {form.employeeType === 'PART_TIME' ? 'Mức lương (VNĐ/giờ)' : 'Mức lương (VNĐ/tháng)'}
          </Label>
          <Input
            id="salaryRate"
            type="number"
            value={form.salaryRate}
            onChange={(e) => setForm((f) => ({ ...f, salaryRate: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="capabilitySalary">Lương năng lực (VNĐ)</Label>
          <Input
            id="capabilitySalary"
            type="number"
            value={form.capabilitySalary}
            onChange={(e) => setForm((f) => ({ ...f, capabilitySalary: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="workedHours">Số giờ đã làm</Label>
          <Input
            id="workedHours"
            type="number"
            step="any"
            value={form.workedHours}
            onChange={(e) => setForm((f) => ({ ...f, workedHours: e.target.value }))}
          />
        </div>
      </div>
    </CrudFormDialog>
  );
}
