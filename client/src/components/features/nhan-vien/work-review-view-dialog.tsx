'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkReviewView } from '@/components/features/nhan-vien/work-review-view';
import { api } from '@/lib/api-client';
import type { WorkReview } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string | null;
}

export function WorkReviewViewDialog({ open, onOpenChange, reviewId }: Props) {
  const [review, setReview] = useState<WorkReview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && reviewId) {
      setLoading(true);
      api
        .get<WorkReview>(`/work-reviews/${reviewId}`)
        .then(setReview)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setReview(null);
    }
  }, [open, reviewId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu đánh giá tuần</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
          {!loading && review && (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                {review.employee.name} ({review.employee.code})
              </p>
              <WorkReviewView review={review} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
