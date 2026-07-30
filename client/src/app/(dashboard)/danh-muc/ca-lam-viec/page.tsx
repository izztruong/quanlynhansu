'use client';

import { useEffect, useState } from 'react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { api } from '@/lib/api-client';
import { CrudTable } from '@/components/features/danh-muc/crud-table';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Department, RecordStatus, Shift } from '@/types';

interface FormState {
  name: string;
  startTime: string;
  endTime: string;
  appliesToAllDepartments: boolean;
  departmentIds: string[];
  status: RecordStatus;
}

const emptyForm: FormState = {
  name: '',
  startTime: '',
  endTime: '',
  appliesToAllDepartments: true,
  departmentIds: [],
  status: 'ACTIVE',
};

export default function CaLamViecPage() {
  usePageTitle('Ca làm việc');
  const { items, loading, create, update, remove } = useCrud<Shift>('/shifts');
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        startTime: editing.startTime,
        endTime: editing.endTime,
        appliesToAllDepartments: editing.appliesToAllDepartments,
        departmentIds: editing.departments.map((d) => d.department.id),
        status: editing.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing, dialogOpen]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (shift: Shift) => {
    setEditing(shift);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      departmentIds: form.appliesToAllDepartments ? [] : form.departmentIds,
    };
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  };

  return (
    <div className="space-y-4">
      <CrudTable
        items={items}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        getRowLabel={(item) => item.name}
        columns={[
          { header: 'Tên ca làm việc', cell: (item) => <span className="font-medium">{item.name}</span> },
          {
            header: 'Bộ phận áp dụng',
            cell: (item) =>
              item.appliesToAllDepartments
                ? 'Tất cả bộ phận'
                : item.departments.map((d) => d.department.name).join(', ') || '-',
          },
          {
            header: 'Thời gian ca làm việc',
            cell: (item) => `${item.startTime} - ${item.endTime}`,
          },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa ca làm việc' : 'Thêm ca làm việc'}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Tên ca làm việc</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="startTime">Giờ bắt đầu</Label>
            <Input
              id="startTime"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endTime">Giờ kết thúc</Label>
            <Input
              id="endTime"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="appliesToAll"
            checked={form.appliesToAllDepartments}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, appliesToAllDepartments: checked === true }))
            }
          />
          <Label htmlFor="appliesToAll" className="font-normal">
            Áp dụng cho tất cả bộ phận
          </Label>
        </div>
        {!form.appliesToAllDepartments && (
          <div className="grid gap-2 rounded-md border p-3">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center gap-2">
                <Checkbox
                  id={`dept-${dept.id}`}
                  checked={form.departmentIds.includes(dept.id)}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({
                      ...f,
                      departmentIds:
                        checked === true
                          ? [...f.departmentIds, dept.id]
                          : f.departmentIds.filter((id) => id !== dept.id),
                    }))
                  }
                />
                <Label htmlFor={`dept-${dept.id}`} className="font-normal">
                  {dept.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CrudFormDialog>
    </div>
  );
}
