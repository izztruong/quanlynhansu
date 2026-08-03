'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/simple-select';
import { MultiFileUploadField, type UploadedFile } from '@/components/ui/multi-file-upload-field';
import { EVALUATION_SECTIONS } from '@/lib/evaluation-sections';
import { activeOnly } from '@/lib/record-utils';
import { api } from '@/lib/api-client';
import type { Employee, EvaluationCriteria } from '@/types';

interface AnswerState {
  numberValue: string;
  textValue: string;
  images: UploadedFile[];
  videos: UploadedFile[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fixed employee context, e.g. when opened from an employee's own detail page. */
  employeeId?: string;
  /** When provided instead of a fixed employeeId, shows a picker (e.g. the management page). */
  employees?: Employee[];
  onCreated: () => void;
}

export function EvaluationFormDialog({
  open,
  onOpenChange,
  employeeId,
  employees,
  onCreated,
}: Props) {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId ?? '');

  useEffect(() => {
    if (open) {
      api.get<EvaluationCriteria[]>('/evaluation-criteria').then((data) => {
        const active = activeOnly(data);
        setCriteria(active);
        setAnswers(
          active.reduce((acc, c) => {
            acc[c.id] = { numberValue: '', textValue: '', images: [], videos: [] };
            return acc;
          }, {} as Record<string, AnswerState>)
        );
      });
      setSelectedEmployeeId(employeeId ?? employees?.[0]?.id ?? '');
    }
  }, [open, employeeId, employees]);

  const updateAnswer = (criteriaId: string, patch: Partial<AnswerState>) => {
    setAnswers((a) => ({ ...a, [criteriaId]: { ...a[criteriaId], ...patch } }));
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId) {
      toast.error('Vui lòng chọn nhân viên');
      return;
    }

    const answerPayload = criteria
      .filter((c) => {
        const a = answers[c.id];
        return c.inputType === 'NUMBER' ? a.numberValue !== '' : a.textValue !== '';
      })
      .map((c) => {
        const a = answers[c.id];
        return {
          criteriaId: c.id,
          numberValue: c.inputType === 'NUMBER' ? Number(a.numberValue) : undefined,
          textValue: c.inputType === 'TEXT' ? a.textValue : undefined,
        };
      });

    const attachmentPayload = criteria.flatMap((c) => {
      const a = answers[c.id];
      return [
        ...a.images.map((f) => ({ criteriaId: c.id, type: 'IMAGE' as const, key: f.key })),
        ...a.videos.map((f) => ({ criteriaId: c.id, type: 'VIDEO' as const, key: f.key })),
      ];
    });

    await api.post('/evaluations', {
      employeeId: selectedEmployeeId,
      answers: answerPayload,
      attachments: attachmentPayload,
    });
    toast.success('Đã tạo phiếu đánh giá');
    onCreated();
  };

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tạo phiếu đánh giá"
      onSubmit={handleSubmit}
      contentClassName="sm:max-w-2xl"
    >
      {employees && (
        <div className="grid gap-2">
          <Label>Nhân viên</Label>
          <SimpleSelect
            value={selectedEmployeeId}
            onValueChange={setSelectedEmployeeId}
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.code})` }))}
          />
        </div>
      )}

      {EVALUATION_SECTIONS.map((group) => {
        const groupCriteria = criteria
          .filter((c) => c.section === group.value)
          .sort((a, b) => a.order - b.order);
        if (groupCriteria.length === 0) return null;

        return (
          <div key={group.value} className="grid gap-3 rounded-lg border p-4">
            <p className="text-base font-semibold">{group.label}</p>

            {groupCriteria.map((c) => (
              <div key={c.id} className="grid gap-2">
                <Label htmlFor={c.id}>{c.name}</Label>
                {c.inputType === 'NUMBER' ? (
                  <Input
                    id={c.id}
                    type="number"
                    step="any"
                    value={answers[c.id]?.numberValue ?? ''}
                    onChange={(e) => updateAnswer(c.id, { numberValue: e.target.value })}
                  />
                ) : (
                  <Textarea
                    id={c.id}
                    placeholder="Nhận xét..."
                    value={answers[c.id]?.textValue ?? ''}
                    onChange={(e) => updateAnswer(c.id, { textValue: e.target.value })}
                  />
                )}
                {c.allowAttachment && (
                  <div className="grid grid-cols-2 gap-4">
                    <MultiFileUploadField
                      label="Ảnh"
                      accept="image/*"
                      folder="evaluations"
                      files={answers[c.id]?.images ?? []}
                      onChange={(images) => updateAnswer(c.id, { images })}
                    />
                    <MultiFileUploadField
                      label="Video"
                      accept="video/*"
                      folder="evaluations"
                      files={answers[c.id]?.videos ?? []}
                      onChange={(videos) => updateAnswer(c.id, { videos })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </CrudFormDialog>
  );
}
