'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { api } from '@/lib/api-client';
import { CrudTable } from '@/components/features/danh-muc/crud-table';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/simple-select';
import type { Branch, Department, News, RecordStatus } from '@/types';

interface FormState {
  title: string;
  thumbnailUrl: string;
  content: string;
  branchId: string;
  departmentId: string;
  status: RecordStatus;
}

const emptyForm: FormState = {
  title: '',
  thumbnailUrl: '',
  content: '',
  branchId: 'all',
  departmentId: 'all',
  status: 'ACTIVE',
};

export default function TruyenThongPage() {
  usePageTitle('Tin tức');
  const { items, loading, create, update, remove } = useCrud<News>('/news');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        thumbnailUrl: editing.thumbnailUrl ?? '',
        content: editing.content ?? '',
        branchId: editing.branch?.id ?? 'all',
        departmentId: editing.department?.id ?? 'all',
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

  const openEdit = (news: News) => {
    setEditing(news);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      thumbnailUrl: form.thumbnailUrl || undefined,
      content: form.content || undefined,
      branchId: form.branchId === 'all' ? undefined : form.branchId,
      departmentId: form.departmentId === 'all' ? undefined : form.departmentId,
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
        items={items}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        addLabel="Thêm mới"
        getRowLabel={(item) => item.title}
        columns={[
          {
            header: 'Tiêu đề',
            className: 'max-w-md',
            cell: (item) => (
              <div className="flex items-center gap-3">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <ImageIcon className="size-4" />
                  </div>
                )}
                <span className="line-clamp-2">{item.title}</span>
              </div>
            ),
          },
          {
            header: 'Chi nhánh áp dụng',
            cell: (item) => item.branch?.name ?? 'Tất cả chi nhánh',
          },
          {
            header: 'Bộ phận áp dụng',
            cell: (item) => item.department?.name ?? 'Tất cả bộ phận',
          },
          { header: 'Nhân viên đã xem', cell: (item) => item.viewCount },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa tin tức' : 'Thêm tin tức'}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-2xl"
      >
        <div className="grid gap-2">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="thumbnailUrl">Ảnh thumbnail (URL)</Label>
          <Input
            id="thumbnailUrl"
            value={form.thumbnailUrl}
            onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content">Nội dung</Label>
          <Textarea
            id="content"
            className="min-h-48 resize-none"
            placeholder="Điền nội dung"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Chi nhánh áp dụng</Label>
            <SimpleSelect
              value={form.branchId}
              onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}
              options={[
                { value: 'all', label: 'Tất cả chi nhánh' },
                ...branches.map((b) => ({ value: b.id, label: b.name })),
              ]}
            />
          </div>
          <div className="grid gap-2">
            <Label>Bộ phận áp dụng</Label>
            <SimpleSelect
              value={form.departmentId}
              onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}
              options={[
                { value: 'all', label: 'Tất cả bộ phận' },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </div>
        </div>
      </CrudFormDialog>
    </div>
  );
}
