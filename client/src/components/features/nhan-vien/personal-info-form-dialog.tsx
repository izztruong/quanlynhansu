'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import type { Employee, Gender } from '@/types';

interface FormState {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | 'unset';
  hireDate: string;
  permanentAddress: string;
  currentAddress: string;
  bankName: string;
  bankAccountNumber: string;
}

function toFormState(employee: Employee): FormState {
  return {
    name: employee.name,
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    dateOfBirth: employee.dateOfBirth?.slice(0, 10) ?? '',
    gender: employee.gender ?? 'unset',
    hireDate: employee.hireDate?.slice(0, 10) ?? '',
    permanentAddress: employee.permanentAddress ?? '',
    currentAddress: employee.currentAddress ?? '',
    bankName: employee.bankName ?? '',
    bankAccountNumber: employee.bankAccountNumber ?? '',
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onChanged: () => void;
}

export function PersonalInfoFormDialog({ open, onOpenChange, employee, onChanged }: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(employee));

  useEffect(() => {
    if (open) setForm(toFormState(employee));
  }, [open, employee]);

  const handleSubmit = async () => {
    const grantingLogin = Boolean(form.email) && !employee.email;
    await api.put(`/employees/${employee.id}`, {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender === 'unset' ? undefined : form.gender,
      hireDate: form.hireDate || undefined,
      permanentAddress: form.permanentAddress || undefined,
      currentAddress: form.currentAddress || undefined,
      bankName: form.bankName || undefined,
      bankAccountNumber: form.bankAccountNumber || undefined,
    });
    toast.success('Đã cập nhật thông tin cơ bản');
    if (grantingLogin) {
      toast.info('Đã cấp tài khoản đăng nhập — mật khẩu mặc định: 123456');
    }
    onChanged();
  };

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cập nhật thông tin cơ bản"
      onSubmit={handleSubmit}
      contentClassName="sm:max-w-lg"
    >
      <div className="grid gap-2">
        <Label htmlFor="pi-name">Họ tên</Label>
        <Input
          id="pi-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="pi-email">Email</Label>
        <Input
          id="pi-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="nhanvien@congty.com"
        />
        {!employee.email && (
          <p className="text-xs text-muted-foreground">
            Chưa có tài khoản đăng nhập. Điền email để cấp tài khoản, mật khẩu mặc định{' '}
            <span className="font-medium">123456</span>.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pi-phone">Số điện thoại</Label>
          <Input
            id="pi-phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pi-dob">Ngày sinh</Label>
          <Input
            id="pi-dob"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Giới tính</Label>
          <SimpleSelect
            value={form.gender}
            onValueChange={(v) => setForm((f) => ({ ...f, gender: v as FormState['gender'] }))}
            options={[
              { value: 'unset', label: 'Chưa xác định' },
              { value: 'MALE', label: 'Nam' },
              { value: 'FEMALE', label: 'Nữ' },
              { value: 'OTHER', label: 'Khác' },
            ]}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pi-hire-date">Ngày vào làm</Label>
          <Input
            id="pi-hire-date"
            type="date"
            value={form.hireDate}
            onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="pi-permanent-address">Nơi thường trú</Label>
        <Input
          id="pi-permanent-address"
          value={form.permanentAddress}
          onChange={(e) => setForm((f) => ({ ...f, permanentAddress: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="pi-current-address">Nơi ở hiện tại</Label>
        <Input
          id="pi-current-address"
          value={form.currentAddress}
          onChange={(e) => setForm((f) => ({ ...f, currentAddress: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pi-bank-name">Ngân hàng</Label>
          <Input
            id="pi-bank-name"
            value={form.bankName}
            onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
            placeholder="VD: Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pi-bank-account">Số tài khoản</Label>
          <Input
            id="pi-bank-account"
            value={form.bankAccountNumber}
            onChange={(e) => setForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
          />
        </div>
      </div>
    </CrudFormDialog>
  );
}
