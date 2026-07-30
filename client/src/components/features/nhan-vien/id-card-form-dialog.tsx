'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { api } from '@/lib/api-client';
import type { Employee } from '@/types';

interface FormState {
  idNumber: string;
  idIssueDate: string;
  idIssuePlace: string;
  idFrontImageKey: string;
  idFrontImageUrl: string;
  idBackImageKey: string;
  idBackImageUrl: string;
}

function toFormState(employee: Employee): FormState {
  return {
    idNumber: employee.idNumber ?? '',
    idIssueDate: employee.idIssueDate?.slice(0, 10) ?? '',
    idIssuePlace: employee.idIssuePlace ?? '',
    idFrontImageKey: employee.idFrontImageKey ?? '',
    idFrontImageUrl: employee.idFrontImageUrl ?? '',
    idBackImageKey: employee.idBackImageKey ?? '',
    idBackImageUrl: employee.idBackImageUrl ?? '',
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onChanged: () => void;
}

export function IdCardFormDialog({ open, onOpenChange, employee, onChanged }: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(employee));

  useEffect(() => {
    if (open) setForm(toFormState(employee));
  }, [open, employee]);

  const handleSubmit = async () => {
    await api.put(`/employees/${employee.id}`, {
      idNumber: form.idNumber || undefined,
      idIssueDate: form.idIssueDate || undefined,
      idIssuePlace: form.idIssuePlace || undefined,
      idFrontImageKey: form.idFrontImageKey || undefined,
      idBackImageKey: form.idBackImageKey || undefined,
    });
    toast.success('Đã cập nhật thông tin căn cước');
    onChanged();
  };

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cập nhật thông tin căn cước"
      onSubmit={handleSubmit}
      contentClassName="sm:max-w-lg"
    >
      <div className="grid gap-2">
        <Label htmlFor="id-number">Số căn cước công dân</Label>
        <Input
          id="id-number"
          value={form.idNumber}
          onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="id-issue-date">Ngày cấp</Label>
          <Input
            id="id-issue-date"
            type="date"
            value={form.idIssueDate}
            onChange={(e) => setForm((f) => ({ ...f, idIssueDate: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="id-issue-place">Nơi cấp</Label>
          <Input
            id="id-issue-place"
            value={form.idIssuePlace}
            onChange={(e) => setForm((f) => ({ ...f, idIssuePlace: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField
          label="Ảnh mặt trước"
          imageUrl={form.idFrontImageUrl || null}
          folder="id-cards"
          onUploaded={(key, url) =>
            setForm((f) => ({ ...f, idFrontImageKey: key, idFrontImageUrl: url }))
          }
        />
        <ImageUploadField
          label="Ảnh mặt sau"
          imageUrl={form.idBackImageUrl || null}
          folder="id-cards"
          onUploaded={(key, url) =>
            setForm((f) => ({ ...f, idBackImageKey: key, idBackImageUrl: url }))
          }
        />
      </div>
    </CrudFormDialog>
  );
}
