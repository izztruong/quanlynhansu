'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Eye, Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { usePagination } from '@/hooks/use-pagination';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { formatWeekRange, toLocalISODate } from '@/lib/work-review-utils';
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
import { WorkReviewFormDialog } from '@/components/features/nhan-vien/work-review-form-dialog';
import { WorkReviewViewDialog } from '@/components/features/nhan-vien/work-review-view-dialog';
import type { Branch, Department, Employee, WorkReview } from '@/types';

export default function DanhGiaTuanPage() {
  usePageTitle('Phiếu đánh giá nhân viên (Tuần)');
  const { items: reviews, loading, refresh, remove } = useCrud<WorkReview>('/work-reviews');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<WorkReview | null>(null);
  const [viewReviewId, setViewReviewId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkReview | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { can } = useAuth();

  useEffect(() => {
    api
      .get<Employee[]>('/employees')
      .then(setEmployees)
      .catch(() => toast.error('Không tải được danh sách nhân viên — chức vụ của bạn cần quyền Xem ở mục Nhân viên'));
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
  }, []);

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchesSearch = !keyword || r.employee.name.toLowerCase().includes(keyword);
      const matchesBranch = branchId === 'all' || r.employee.branch.id === branchId;
      const matchesDepartment = departmentId === 'all' || r.employee.department.id === departmentId;
      const week = toLocalISODate(new Date(r.weekStartDate));
      const matchesFrom = !fromDate || week >= fromDate;
      const matchesTo = !toDate || week <= toDate;
      return matchesSearch && matchesBranch && matchesDepartment && matchesFrom && matchesTo;
    });
  }, [reviews, search, branchId, departmentId, fromDate, toDate]);

  const { page, setPage, pageCount, pageItems: pageReviews, totalCount, startIndex } =
    usePagination(filteredReviews);

  const openAdd = () => {
    setEditingReview(null);
    setFormOpen(true);
  };

  const openEdit = (review: WorkReview) => {
    setEditingReview(review);
    setFormOpen(true);
  };

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
            title="Từ tuần"
          />
          <span className="text-sm text-muted-foreground">đến</span>
          <Input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
            title="Đến tuần"
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
          <span className="text-sm text-muted-foreground">Tổng số {totalCount} phiếu</span>
          {can('WORK_REVIEWS', 'create') && (
            <Button size="sm" onClick={openAdd}>
              <Plus className="size-4" />
              Tạo phiếu mới
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Bộ phận</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Tuần đánh giá</TableHead>
              <TableHead>Chấm điểm</TableHead>
              <TableHead className="w-28 text-right">Thao tác</TableHead>
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
                  {reviews.length === 0 ? 'Chưa có phiếu đánh giá' : 'Không tìm thấy phiếu phù hợp'}
                </TableCell>
              </TableRow>
            )}
            {pageReviews.map((review, index) => (
              <TableRow key={review.id}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {review.employee.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{review.employee.name}</div>
                      <div className="text-xs text-muted-foreground">{review.employee.code}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{review.employee.department.name}</TableCell>
                <TableCell className="truncate">{review.employee.branch.name}</TableCell>
                <TableCell>{formatWeekRange(review.weekStartDate)}</TableCell>
                <TableCell className="font-medium">
                  {review.score}/{review.maxScore}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
                      title="Xem chi tiết"
                      onClick={() => setViewReviewId(review.id)}
                    >
                      <Eye className="size-4" />
                    </button>
                    {can('WORK_REVIEWS', 'update') && (
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
                        title="Sửa"
                        onClick={() => openEdit(review)}
                      >
                        <Pencil className="size-4" />
                      </button>
                    )}
                    {can('WORK_REVIEWS', 'delete') && (
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-md text-red-500 hover:bg-muted hover:text-red-600"
                        title="Xoá"
                        onClick={() => setPendingDelete(review)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <WorkReviewFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employees={employees}
        review={editingReview}
        onSaved={() => {
          setFormOpen(false);
          refresh();
        }}
      />

      <WorkReviewViewDialog
        open={viewReviewId !== null}
        onOpenChange={(open) => !open && setViewReviewId(null)}
        reviewId={viewReviewId}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá phiếu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá phiếu đánh giá tuần của &quot;
              {pendingDelete?.employee.name}&quot; tuần{' '}
              {pendingDelete && formatWeekRange(pendingDelete.weekStartDate)}? Hành động này không
              thể hoàn tác.
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
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Xoá thất bại');
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
