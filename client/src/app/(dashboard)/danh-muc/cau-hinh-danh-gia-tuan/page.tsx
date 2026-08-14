'use client';

import { useEffect, useState } from 'react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { CrudTable } from '@/components/features/danh-muc/crud-table';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/simple-select';
import type { RecordStatus, WorkReviewSection } from '@/types';

interface FormState {
  name: string;
  order: string;
  status: RecordStatus;
}

const emptyForm: FormState = { name: '', order: '0', status: 'ACTIVE' };

export default function CauHinhDanhGiaTuanPage() {
  usePageTitle('Cấu hình đánh giá tuần');
  const { items, loading, create, update, remove } =
    useCrud<WorkReviewSection>('/work-review-sections');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkReviewSection | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, order: String(editing.order), status: editing.status });
    } else {
      setForm({ ...emptyForm, order: String(items.length + 1) });
    }
  }, [editing, dialogOpen, items.length]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (section: WorkReviewSection) => {
    setEditing(section);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      order: form.order === '' ? 0 : Number(form.order),
      status: form.status,
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
        resource="WORK_REVIEW_SECTIONS"
        items={items}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        getRowLabel={(item) => item.name}
        addLabel="Thêm mục"
        columns={[
          { header: 'Tên mục', cell: (item) => <span className="font-medium">{item.name}</span> },
          { header: 'Thứ tự', cell: (item) => item.order },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa mục nhận xét' : 'Thêm mục nhận xét'}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="section-name">Tên mục</Label>
          <Input
            id="section-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="VD: Tác phong, thái độ"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="section-order">Thứ tự hiển thị</Label>
            <Input
              id="section-order"
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Trạng thái</Label>
            <SimpleSelect
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v as RecordStatus }))}
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngừng (ẩn khỏi phiếu mới)' },
              ]}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Sửa hoặc xoá mục chỉ ảnh hưởng phiếu tạo mới — phiếu đã lưu giữ nguyên tên mục lúc viết.
        </p>
      </CrudFormDialog>
    </div>
  );
}
