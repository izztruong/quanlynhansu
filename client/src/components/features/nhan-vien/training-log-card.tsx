'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { TrainingLogFormDialog } from '@/components/features/nhan-vien/training-log-form-dialog';
import { TrainingLogViewDialog } from '@/components/features/nhan-vien/training-log-view-dialog';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { gradeLabel, maxTotalScore, totalScore } from '@/lib/training-utils';
import type { Branch, Department, Employee, TrainingLog } from '@/types';

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-';
}

interface Props {
  employee: Employee;
  branches: Branch[];
  departments: Department[];
}

export function TrainingLogCard({ employee, branches, departments }: Props) {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TrainingLog | null>(null);
  const [viewLogId, setViewLogId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TrainingLog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { can } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<TrainingLog[]>(`/training-logs?employeeId=${employee.id}`);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [employee.id]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingLog(null);
    setFormOpen(true);
  };

  const openEdit = (log: TrainingLog) => {
    setEditingLog(log);
    setFormOpen(true);
  };

  const downloadPdf = async (log: TrainingLog) => {
    setDownloadingId(log.id);
    try {
      await api.downloadFile(
        `/training-logs/${log.id}/pdf`,
        `nhat-ky-hoc-viec-${employee.code}.pdf`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tải PDF thất bại');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Nhật ký học việc</h3>
        {can('TRAINING_LOGS', 'create') && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" />
            Tạo phiếu
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}

        {!loading && logs.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Chưa có phiếu học việc nào
          </p>
        )}

        {!loading &&
          logs.map((log) => {
            const total = totalScore(log.scores);
            const maxTotal = maxTotalScore(log.scores);
            return (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{log.department.name}</span>
                    <Badge variant={log.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {log.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang học việc'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(log.startDate)} - {formatDate(log.endDate)} · {log.sessions.length}{' '}
                    buổi
                    {log.mentor && ` · HD: ${log.mentor.name}`}
                  </p>
                  {maxTotal > 0 && (
                    <p className="mt-0.5 text-xs">
                      <span className="text-muted-foreground">Kết quả: </span>
                      <span className="font-medium">
                        {total}/{maxTotal} — {gradeLabel(total, maxTotal)}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    title="Xem chi tiết"
                    onClick={() => setViewLogId(log.id)}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    title="Tải PDF"
                    disabled={downloadingId === log.id}
                    onClick={() => downloadPdf(log)}
                  >
                    <Download className="size-4" />
                  </Button>
                  {can('TRAINING_LOGS', 'update') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      title="Sửa"
                      onClick={() => openEdit(log)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                  {can('TRAINING_LOGS', 'delete') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:text-red-600"
                      title="Xoá"
                      onClick={() => setPendingDelete(log)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <TrainingLogFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={employee}
        branches={branches}
        departments={departments}
        log={editingLog}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <TrainingLogViewDialog
        open={viewLogId !== null}
        onOpenChange={(open) => !open && setViewLogId(null)}
        logId={viewLogId}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá phiếu học việc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá phiếu học việc của &quot;{employee.name}&quot;? Toàn bộ các
              buổi và điểm đã chấm cũng bị xoá. Hành động này không thể hoàn tác.
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
                  await api.delete(`/training-logs/${pendingDelete.id}`);
                  toast.success('Đã xoá phiếu học việc');
                  setPendingDelete(null);
                  await load();
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
