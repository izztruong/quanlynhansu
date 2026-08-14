'use client';

import { useEffect, useState } from 'react';
import { Eye, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { usePagination } from '@/hooks/use-pagination';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { PermissionPicker } from '@/components/features/danh-muc/permission-picker';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { PermissionResource, Position, RecordStatus } from '@/types';

const ACCESS_SCOPES = ['CMS', 'iPOS HRM', 'HRM Chủ'];

interface FormState {
  name: string;
  description: string;
  accessScopes: string[];
  status: RecordStatus;
  permissions: string[];
}

const emptyForm: FormState = {
  name: '',
  description: '',
  accessScopes: [],
  status: 'ACTIVE',
  permissions: [],
};

export default function ChucVuPage() {
  usePageTitle('Chức vụ');
  const { items, loading, create, update, remove } = useCrud<Position>('/positions');
  const [resources, setResources] = useState<PermissionResource[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  /** Chức vụ hệ thống chỉ được xem, không sửa. */
  const [readOnly, setReadOnly] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { can } = useAuth();

  const { page, setPage, pageCount, pageItems, totalCount, startIndex } = usePagination(items);

  useEffect(() => {
    api
      .get<PermissionResource[]>('/positions/permission-resources')
      .then(setResources)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description ?? '',
        accessScopes: editing.accessScopes,
        status: editing.status,
        permissions: editing.permissions,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing, dialogOpen]);

  const openAdd = () => {
    setEditing(null);
    setReadOnly(false);
    setDialogOpen(true);
  };

  const openEdit = (position: Position) => {
    setEditing(position);
    setReadOnly(position.isSystem);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      accessScopes: form.accessScopes,
      status: form.status,
      permissions: form.permissions,
    };
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-sm text-muted-foreground">Tổng số {totalCount} chức vụ</span>
          {can('POSITIONS', 'create') && (
            <Button size="sm" onClick={openAdd}>
              <Plus className="size-4" />
              Thêm mới
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tên chức vụ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Quyền truy cập</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}
            {!loading && totalCount === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
            {pageItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground">{startIndex + index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.isSystem && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="size-3" />
                        Hệ thống
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.description || '-'}</TableCell>
                <TableCell>{item.accessScopes.join(', ') || '-'}</TableCell>
                <TableCell>
                  <RecordStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {item.isSystem ? (
                      // Chức vụ hệ thống chỉ xem — đây là chốt chặn để cấu hình
                      // phân quyền sai không khoá được hết mọi người ra ngoài.
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Xem chi tiết"
                        onClick={() => openEdit(item)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    ) : (
                      <>
                        {can('POSITIONS', 'update') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title="Sửa"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {can('POSITIONS', 'delete') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-500 hover:text-red-600"
                            title="Xoá"
                            onClick={() => setPendingDelete(item)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={readOnly ? 'Chi tiết chức vụ' : editing ? 'Sửa chức vụ' : 'Tạo chức vụ'}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-2xl"
        hideSubmit={readOnly}
      >
        {readOnly && (
          <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            Đây là chức vụ hệ thống — luôn có toàn quyền và không thể sửa hoặc xoá.
          </p>
        )}

        <div className="grid gap-2">
          <Label htmlFor="name">Tên chức vụ</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            disabled={readOnly}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            disabled={readOnly}
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
                  disabled={readOnly}
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

        <div className="grid gap-2">
          <Label>Phân quyền chức năng</Label>
          <PermissionPicker
            resources={resources}
            value={form.permissions}
            onChange={(permissions) => setForm((f) => ({ ...f, permissions }))}
            disabled={readOnly}
          />
        </div>
      </CrudFormDialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá chức vụ &quot;{pendingDelete?.name}&quot;? Hành động này
              không thể hoàn tác.
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
