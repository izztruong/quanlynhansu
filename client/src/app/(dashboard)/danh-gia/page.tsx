'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Plus, ImageIcon, Video, Trash2, X } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { usePagination } from '@/hooks/use-pagination';
import { api } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EvaluationFormDialog } from '@/components/features/nhan-vien/evaluation-form-dialog';
import { EvaluationViewDialog } from '@/components/features/nhan-vien/evaluation-view-dialog';
import type { Branch, Department, Employee, EvaluationForm } from '@/types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN');
}

// Ngày theo múi giờ máy người dùng, khớp với ngày đang hiển thị ở cột "Ngày
// tạo" — cắt thẳng chuỗi UTC sẽ lệch một ngày với phiếu tạo vào buổi tối.
function toLocalISODate(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function DanhGiaPage() {
  usePageTitle('Phiếu đánh giá nhân viên');
  const { items: forms, loading, refresh, remove } = useCrud<EvaluationForm>('/evaluations');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewFormId, setViewFormId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EvaluationForm | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get<Employee[]>('/employees').then(setEmployees).catch(() => {});
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
  }, []);

  const filteredForms = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return forms.filter((f) => {
      const matchesSearch = !keyword || f.employee.name.toLowerCase().includes(keyword);
      const matchesBranch = branchId === 'all' || f.employee.branch.id === branchId;
      const matchesDepartment = departmentId === 'all' || f.employee.department.id === departmentId;
      const createdOn = toLocalISODate(f.createdAt);
      const matchesFrom = !fromDate || createdOn >= fromDate;
      const matchesTo = !toDate || createdOn <= toDate;
      return matchesSearch && matchesBranch && matchesDepartment && matchesFrom && matchesTo;
    });
  }, [forms, search, branchId, departmentId, fromDate, toDate]);

  const { page, setPage, pageCount, pageItems: pageForms, totalCount, startIndex } =
    usePagination(filteredForms);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhân viên..."
            className="w-64 pl-8"
          />
        </div>
        <SimpleSelect
          value={branchId}
          onValueChange={setBranchId}
          className="w-56"
          options={[
            { value: 'all', label: 'Tất cả chi nhánh' },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <SimpleSelect
          value={departmentId}
          onValueChange={setDepartmentId}
          className="w-48"
          options={[
            { value: 'all', label: 'Tất cả bộ phận' },
            ...departments.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
            title="Từ ngày"
          />
          <span className="text-sm text-muted-foreground">đến</span>
          <Input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
            title="Đến ngày"
          />
          {(fromDate || toDate) && (
            <Button
              variant="outline"
              size="icon"
              title="Xoá lọc thời gian"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-sm text-muted-foreground">
            Tổng số {totalCount} phiếu đánh giá
          </span>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Tạo phiếu mới
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Bộ phận</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}
            {!loading && totalCount === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {forms.length === 0 ? 'Chưa có phiếu đánh giá' : 'Không tìm thấy phiếu phù hợp'}
                </TableCell>
              </TableRow>
            )}
            {pageForms.map((form, index) => {
              const imageCount = form.attachments.filter((a) => a.type === 'IMAGE').length;
              const videoCount = form.attachments.filter((a) => a.type === 'VIDEO').length;
              return (
                <TableRow key={form.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {form.employee.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{form.employee.name}</div>
                        <div className="text-xs text-muted-foreground">{form.employee.code}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="truncate">{form.employee.branch.name}</TableCell>
                  <TableCell>{form.employee.department.name}</TableCell>
                  <TableCell>{formatDate(form.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {imageCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="size-3.5" />
                          {imageCount}
                        </span>
                      )}
                      {videoCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Video className="size-3.5" />
                          {videoCount}
                        </span>
                      )}
                      {imageCount === 0 && videoCount === 0 && '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
                        title="Xem chi tiết"
                        onClick={() => setViewFormId(form.id)}
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-md text-red-500 hover:bg-muted hover:text-red-600"
                        title="Xóa phiếu"
                        onClick={() => setPendingDelete(form)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <EvaluationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        employees={employees}
        onCreated={() => {
          setCreateOpen(false);
          refresh();
        }}
      />

      <EvaluationViewDialog
        open={viewFormId !== null}
        onOpenChange={(open) => !open && setViewFormId(null)}
        formId={viewFormId}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá phiếu đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá phiếu đánh giá của "{pendingDelete?.employee.name}" ngày{' '}
              {pendingDelete && formatDate(pendingDelete.createdAt)}? Ảnh/video đính kèm cũng sẽ bị
              xoá vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={async () => {
                if (!pendingDelete) return;
                setDeleting(true);
                try {
                  await remove(pendingDelete.id);
                  setPendingDelete(null);
                } finally {
                  setDeleting(false);
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
