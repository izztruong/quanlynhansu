'use client';

import { useEffect, useState } from 'react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { CrudTable } from '@/components/features/danh-muc/crud-table';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SimpleSelect } from '@/components/ui/simple-select';
import { EVALUATION_SECTIONS, evaluationSectionLabel } from '@/lib/evaluation-sections';
import type { EvaluationCriteria, EvaluationInputType, EvaluationSection, RecordStatus } from '@/types';

interface FormState {
  section: EvaluationSection;
  name: string;
  inputType: EvaluationInputType;
  allowAttachment: boolean;
  order: string;
  status: RecordStatus;
}

const emptyForm: FormState = {
  section: 'WORK_ATTITUDE',
  name: '',
  inputType: 'TEXT',
  allowAttachment: false,
  order: '0',
  status: 'ACTIVE',
};

export default function TieuChiDanhGiaPage() {
  usePageTitle('Cấu hình phiếu đánh giá');
  const { items, loading, create, update, remove } = useCrud<EvaluationCriteria>('/evaluation-criteria');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EvaluationCriteria | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        section: editing.section,
        name: editing.name,
        inputType: editing.inputType,
        allowAttachment: editing.allowAttachment,
        order: String(editing.order),
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

  const openEdit = (criteria: EvaluationCriteria) => {
    setEditing(criteria);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      section: form.section,
      name: form.name,
      inputType: form.inputType,
      allowAttachment: form.allowAttachment,
      order: form.order === '' ? 0 : Number(form.order),
      status: form.status,
    };
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  };

  const sorted = [...items].sort((a, b) =>
    a.section === b.section ? a.order - b.order : a.section.localeCompare(b.section)
  );

  return (
    <div className="space-y-4">
      <CrudTable
        resource="EVALUATION_CRITERIA"
        items={sorted}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        getRowLabel={(item) => item.name}
        columns={[
          { header: 'Phần', cell: (item) => evaluationSectionLabel(item.section) },
          { header: 'Tên tiêu chí', cell: (item) => <span className="font-medium">{item.name}</span> },
          {
            header: 'Loại giá trị',
            cell: (item) => (item.inputType === 'NUMBER' ? 'Số' : 'Văn bản'),
          },
          { header: 'Đính kèm ảnh/video', cell: (item) => (item.allowAttachment ? 'Có' : 'Không') },
          { header: 'Thứ tự', cell: (item) => item.order },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa tiêu chí đánh giá' : 'Thêm tiêu chí đánh giá'}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label>Thuộc phần</Label>
          <SimpleSelect
            value={form.section}
            onValueChange={(v) => setForm((f) => ({ ...f, section: v as EvaluationSection }))}
            options={EVALUATION_SECTIONS.map((s) => ({ value: s.value, label: s.label }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Tên tiêu chí</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Loại giá trị</Label>
            <SimpleSelect
              value={form.inputType}
              onValueChange={(v) => setForm((f) => ({ ...f, inputType: v as EvaluationInputType }))}
              options={[
                { value: 'TEXT', label: 'Văn bản' },
                { value: 'NUMBER', label: 'Số' },
              ]}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="order">Thứ tự hiển thị</Label>
            <Input
              id="order"
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="allowAttachment"
            checked={form.allowAttachment}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, allowAttachment: checked === true }))
            }
          />
          <Label htmlFor="allowAttachment" className="font-normal">
            Cho phép đính kèm ảnh/video khi chấm tiêu chí này
          </Label>
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
      </CrudFormDialog>
    </div>
  );
}
