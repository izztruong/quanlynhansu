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
import { Checkbox } from '@/components/ui/checkbox';
import type { Position, RecordStatus } from '@/types';

const ACCESS_SCOPES = ['CMS', 'iPOS HRM', 'HRM Chủ'];

interface FormState {
  name: string;
  description: string;
  accessScopes: string[];
  status: RecordStatus;
}

const emptyForm: FormState = { name: '', description: '', accessScopes: [], status: 'ACTIVE' };

export default function ChucVuPage() {
  usePageTitle('Chức vụ');
  const { items, loading, create, update, remove } = useCrud<Position>('/positions');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description ?? '',
        accessScopes: editing.accessScopes,
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

  const openEdit = (position: Position) => {
    setEditing(position);
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
        items={items}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        getRowLabel={(item) => item.name}
        columns={[
          { header: 'Tên chức vụ', cell: (item) => <span className="font-medium">{item.name}</span> },
          { header: 'Mô tả', cell: (item) => item.description || '-' },
          { header: 'Quyền truy cập', cell: (item) => item.accessScopes.join(', ') || '-' },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa chức vụ' : 'Thêm chức vụ'}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Tên chức vụ</Label>
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
        <div className="grid gap-2">
          <Label>Quyền truy cập</Label>
          <div className="flex flex-wrap gap-4">
            {ACCESS_SCOPES.map((scope) => (
              <div key={scope} className="flex items-center gap-2">
                <Checkbox
                  id={`scope-${scope}`}
                  checked={form.accessScopes.includes(scope)}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({
                      ...f,
                      accessScopes:
                        checked === true
                          ? [...f.accessScopes, scope]
                          : f.accessScopes.filter((s) => s !== scope),
                    }))
                  }
                />
                <Label htmlFor={`scope-${scope}`} className="font-normal">
                  {scope}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CrudFormDialog>
    </div>
  );
}
