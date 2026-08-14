'use client';

import { toast } from 'sonner';
import { useEffect, useState } from 'react';
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
import { MultiSelectChips } from '@/components/ui/multi-select-chips';
import type {
  Branch,
  Department,
  Employee,
  EmployeeGroupScope,
  Notification,
  RecordStatus,
} from '@/types';

interface FormState {
  title: string;
  content: string;
  branchIds: string[] | null;
  departmentIds: string[] | null;
  employeeGroupScope: EmployeeGroupScope;
  specificEmployeeIds: string[];
  status: RecordStatus;
}

const emptyForm: FormState = {
  title: '',
  content: '',
  branchIds: null,
  departmentIds: null,
  employeeGroupScope: 'ALL',
  specificEmployeeIds: [],
  status: 'ACTIVE',
};

const EMPLOYEE_GROUP_OPTIONS: { value: EmployeeGroupScope; label: string }[] = [
  { value: 'ALL', label: 'Tất cả nhân viên' },
  { value: 'FULL_TIME', label: 'Nhân viên toàn thời gian' },
  { value: 'PART_TIME', label: 'Nhân viên bán thời gian' },
  { value: 'SPECIFIC', label: 'Nhân viên cụ thể' },
];

function scopeLabel(
  appliesToAll: boolean,
  items: { branch?: { name: string }; department?: { name: string } }[],
  allLabel: string
) {
  if (appliesToAll) return allLabel;
  if (items.length === 0) return '-';
  return items.map((i) => i.branch?.name ?? i.department?.name).join(', ');
}

function employeeGroupLabel(item: Notification) {
  if (item.employeeGroupScope === 'SPECIFIC') {
    return item.specificEmployees.length
      ? item.specificEmployees.map((e) => e.employee.name).join(', ')
      : 'Nhân viên cụ thể';
  }
  return EMPLOYEE_GROUP_OPTIONS.find((o) => o.value === item.employeeGroupScope)?.label;
}

export default function ThongBaoPage() {
  usePageTitle('Thông báo');
  const { items, loading, create, update, remove } = useCrud<Notification>('/notifications');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
    api
      .get<Employee[]>('/employees')
      .then(setEmployees)
      .catch(() => toast.error('Không tải được danh sách nhân viên — chức vụ của bạn cần quyền Xem ở mục Nhân viên'));
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        content: editing.content,
        branchIds: editing.appliesToAllBranches
          ? null
          : editing.branches.map((b) => b.branch.id),
        departmentIds: editing.appliesToAllDepartments
          ? null
          : editing.departments.map((d) => d.department.id),
        employeeGroupScope: editing.employeeGroupScope,
        specificEmployeeIds: editing.specificEmployees.map((e) => e.employee.id),
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

  const openEdit = (notification: Notification) => {
    setEditing(notification);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      content: form.content,
      appliesToAllBranches: form.branchIds === null,
      branchIds: form.branchIds ?? [],
      appliesToAllDepartments: form.departmentIds === null,
      departmentIds: form.departmentIds ?? [],
      employeeGroupScope: form.employeeGroupScope,
      specificEmployeeIds:
        form.employeeGroupScope === 'SPECIFIC' ? form.specificEmployeeIds : [],
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
        addLabel="Thêm thông báo"
        getRowLabel={(item) => item.title}
        columns={[
          {
            header: 'Tiêu đề',
            className: 'max-w-xs',
            cell: (item) => <span className="line-clamp-2 font-medium">{item.title}</span>,
          },
          {
            header: 'Chi nhánh áp dụng',
            cell: (item) => scopeLabel(item.appliesToAllBranches, item.branches, 'Tất cả chi nhánh'),
          },
          {
            header: 'Bộ phận áp dụng',
            cell: (item) =>
              scopeLabel(item.appliesToAllDepartments, item.departments, 'Tất cả bộ phận'),
          },
          {
            header: 'Nhóm nhân viên áp dụng',
            className: 'max-w-xs',
            cell: (item) => <span className="line-clamp-2">{employeeGroupLabel(item)}</span>,
          },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa thông báo' : 'Thêm thông báo'}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-2xl"
      >
        <div className="grid gap-2">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            placeholder="Điền tiêu đề"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
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
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Chi nhánh áp dụng</Label>
            <MultiSelectChips
              allLabel="Tất cả chi nhánh"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              value={form.branchIds}
              onChange={(v) => setForm((f) => ({ ...f, branchIds: v }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Bộ phận áp dụng</Label>
            <MultiSelectChips
              allLabel="Tất cả bộ phận"
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
              value={form.departmentIds}
              onChange={(v) => setForm((f) => ({ ...f, departmentIds: v }))}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>
            Chọn nhóm nhân viên áp dụng <span className="text-destructive">*</span>
          </Label>
          <SimpleSelect
            value={form.employeeGroupScope}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, employeeGroupScope: v as EmployeeGroupScope }))
            }
            options={EMPLOYEE_GROUP_OPTIONS}
          />
        </div>

        {form.employeeGroupScope === 'SPECIFIC' && (
          <div className="grid gap-2">
            <Label>
              Chọn nhân viên cụ thể <span className="text-destructive">*</span>
            </Label>
            <MultiSelectChips
              hideAllOption
              placeholder="Chưa chọn nhân viên"
              options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.code})` }))}
              value={form.specificEmployeeIds}
              onChange={(v) => setForm((f) => ({ ...f, specificEmployeeIds: v ?? [] }))}
            />
          </div>
        )}
      </CrudFormDialog>
    </div>
  );
}
