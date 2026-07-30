'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EvaluationFormView } from '@/components/features/nhan-vien/evaluation-form-view';
import { api } from '@/lib/api-client';
import type { EvaluationForm } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string | null;
}

export function EvaluationViewDialog({ open, onOpenChange, formId }: Props) {
  const [form, setForm] = useState<EvaluationForm | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && formId) {
      setLoading(true);
      api
        .get<EvaluationForm>(`/evaluations/${formId}`)
        .then(setForm)
        .finally(() => setLoading(false));
    } else {
      setForm(null);
    }
  }, [open, formId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu đánh giá</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
          {!loading && form && (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                {form.employee.name} ({form.employee.code}) —{' '}
                {new Date(form.createdAt).toLocaleDateString('vi-VN')}
              </p>
              <EvaluationFormView form={form} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
