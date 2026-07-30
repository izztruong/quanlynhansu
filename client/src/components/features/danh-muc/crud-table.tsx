'use client';

import { useState, type ReactNode } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';

export interface CrudColumn<T> {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
}

interface CrudTableProps<T extends { id: string }> {
  items: T[];
  columns: CrudColumn<T>[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => Promise<void>;
  addLabel?: string;
  getRowLabel?: (item: T) => string;
}

export function CrudTable<T extends { id: string }>({
  items,
  columns,
  loading,
  onAdd,
  onEdit,
  onDelete,
  addLabel = 'Thêm mới',
  getRowLabel,
}: CrudTableProps<T>) {
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { page, setPage, pageCount, pageItems, totalCount, startIndex } = usePagination(items);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <span className="text-sm text-muted-foreground">
          Tổng số {totalCount} mục
        </span>
        <Button onClick={onAdd} size="sm">
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              {columns.map((col) => (
                <TableHead key={col.header} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-24 text-center text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}
            {!loading && totalCount === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-24 text-center text-muted-foreground">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
            {pageItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground">{startIndex + index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.header} className={col.className}>
                    {col.cell(item)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:text-red-600"
                      onClick={() => setPendingDelete(item)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá{' '}
              {pendingDelete && getRowLabel ? `"${getRowLabel(pendingDelete)}"` : 'mục này'}? Hành
              động này không thể hoàn tác.
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
                  await onDelete(pendingDelete);
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
