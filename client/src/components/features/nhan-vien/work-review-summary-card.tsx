'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkReviewFormDialog } from '@/components/features/nhan-vien/work-review-form-dialog';
import { WorkReviewView } from '@/components/features/nhan-vien/work-review-view';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import type { WorkReview } from '@/types';

interface Props {
  employeeId: string;
}

export function WorkReviewSummaryCard({ employeeId }: Props) {
  const [review, setReview] = useState<WorkReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const { can } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    return api
      .get<WorkReview | null>(`/work-reviews/employee/${employeeId}/latest`)
      .then(setReview)
      .catch(() => setReview(null))
      .finally(() => setLoading(false));
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Phiếu đánh giá nhân viên (Tuần)</h3>
          <p className="text-xs text-muted-foreground">Phiếu gần nhất</p>
        </div>
        {can('WORK_REVIEWS', 'create') && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Tạo phiếu
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
      {!loading && !review && (
        <p className="text-sm text-muted-foreground">Chưa có phiếu đánh giá tuần</p>
      )}
      {!loading && review && <WorkReviewView review={review} />}

      <WorkReviewFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        employeeId={employeeId}
        onSaved={() => {
          setCreateOpen(false);
          load();
        }}
      />
    </div>
  );
}
