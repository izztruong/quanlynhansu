'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { CrudTable } from '@/components/features/danh-muc/crud-table';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Level, RecordStatus } from '@/types';

interface FormState {
  name: string;
  description: string;
  imageUrl: string;
  status: RecordStatus;
}

const emptyForm: FormState = { name: '', description: '', imageUrl: '', status: 'ACTIVE' };

export default function LevelPage() {
  usePageTitle('Level');
  const { items, loading, create, update, remove } = useCrud<Level>('/levels');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Level | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description ?? '',
        imageUrl: editing.imageUrl ?? '',
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

  const openEdit = (level: Level) => {
    setEditing(level);
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
        resource="LEVELS"
        items={items}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        getRowLabel={(item) => item.name}
        columns={[
          {
            header: 'Ảnh',
            cell: (item) =>
              item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="size-9 rounded-full bg-muted" />
              ),
          },
          { header: 'Tên level', cell: (item) => <span className="font-medium">{item.name}</span> },
          { header: 'Mô tả', cell: (item) => item.description || '-' },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa level' : 'Thêm level'}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Tên level</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Ảnh (URL)</Label>
          <Input
            id="imageUrl"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://..."
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
