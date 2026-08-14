'use client';

import { useEffect, useState } from 'react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { CrudTable } from '@/components/features/danh-muc/crud-table';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Department, RecordStatus } from '@/types';

interface FormState {
  name: string;
  description: string;
  status: RecordStatus;
}

const emptyForm: FormState = { name: '', description: '', status: 'ACTIVE' };

export default function BoPhanPage() {
  usePageTitle('Bộ phận');
  const { items, loading, create, update, remove } = useCrud<Department>('/departments');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description ?? '',
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

  const openEdit = (department: Department) => {
    setEditing(department);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await update(editing.id, form);
    } else {
      await create(form);
    }
  };

  return (
    <div className="space-y-4">
      <CrudTable
        resource="DEPARTMENTS"
        items={items}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        getRowLabel={(item) => item.name}
        columns={[
          { header: 'Tên bộ phận', cell: (item) => <span className="font-medium">{item.name}</span> },
          { header: 'Mô tả', cell: (item) => item.description || '-' },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa bộ phận' : 'Thêm bộ phận'}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Tên bộ phận</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </CrudFormDialog>
    </div>
  );
}
