'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EvaluationFormDialog } from '@/components/features/nhan-vien/evaluation-form-dialog';
import { EvaluationFormView } from '@/components/features/nhan-vien/evaluation-form-view';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import type { EvaluationForm } from '@/types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN');
}

interface Props {
  employeeId: string;
}

export function EvaluationSummaryCard({ employeeId }: Props) {
  const [form, setForm] = useState<EvaluationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const { can } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    return api
      .get<EvaluationForm | null>(`/evaluations/employee/${employeeId}/latest`)
      .then(setForm)
      .finally(() => setLoading(false));
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Đánh giá chi tiết nhân sự</h3>
          {form && (
            <p className="text-xs text-muted-foreground">Tạo ngày {formatDate(form.createdAt)}</p>
          )}
        </div>
        {can('EVALUATIONS', 'create') && (
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Tạo phiếu mới
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}

      {!loading && !form && (
        <p className="text-sm text-muted-foreground">Chưa có phiếu đánh giá nào</p>
      )}

      {!loading && form && <EvaluationFormView form={form} />}

      <EvaluationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        employeeId={employeeId}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
      />
    </div>
  );
}
