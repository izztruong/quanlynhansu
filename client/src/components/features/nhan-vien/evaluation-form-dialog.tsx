'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/simple-select';
import { MultiFileUploadField, type UploadedFile } from '@/components/ui/multi-file-upload-field';
import { EVALUATION_GROUPS, EVALUATION_SECTIONS, type NumericFieldConfig } from '@/lib/evaluation-sections';
import { api } from '@/lib/api-client';
import type { Employee, EvaluationSection } from '@/types';

interface SectionState {
  text: string;
  images: UploadedFile[];
  videos: UploadedFile[];
}

type SectionsState = Record<EvaluationSection, SectionState>;
type NumericState = Record<NumericFieldConfig['key'], string>;

const NUMERIC_KEYS: NumericFieldConfig['key'][] = EVALUATION_GROUPS.flatMap((g) =>
  g.numericFields.map((f) => f.key)
);

function emptySections(): SectionsState {
  return EVALUATION_SECTIONS.reduce((acc, s) => {
    acc[s.section] = { text: '', images: [], videos: [] };
    return acc;
  }, {} as SectionsState);
}

function emptyNumeric(): NumericState {
  return NUMERIC_KEYS.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {} as NumericState);
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
  const [sections, setSections] = useState<SectionsState>(emptySections);
  const [numeric, setNumeric] = useState<NumericState>(emptyNumeric);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId ?? '');

  useEffect(() => {
    if (open) {
      setSections(emptySections());
      setNumeric(emptyNumeric());
      setSelectedEmployeeId(employeeId ?? employees?.[0]?.id ?? '');
    }
  }, [open, employeeId, employees]);

  const updateSection = (section: EvaluationSection, patch: Partial<SectionState>) => {
    setSections((s) => ({ ...s, [section]: { ...s[section], ...patch } }));
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId) {
      toast.error('Vui lòng chọn nhân viên');
      return;
    }

    const attachments = EVALUATION_SECTIONS.flatMap((s) => [
      ...sections[s.section].images.map((f) => ({ section: s.section, type: 'IMAGE' as const, key: f.key })),
      ...sections[s.section].videos.map((f) => ({ section: s.section, type: 'VIDEO' as const, key: f.key })),
    ]);

    const numericPayload = NUMERIC_KEYS.reduce(
      (acc, key) => {
        acc[key] = numeric[key] === '' ? undefined : Number(numeric[key]);
        return acc;
      },
      {} as Record<NumericFieldConfig['key'], number | undefined>
    );

    await api.post('/evaluations', {
      employeeId: selectedEmployeeId,
      ...numericPayload,
      recentTestNote: sections.RECENT_TEST.text || undefined,
      managerReviewText: sections.MANAGER_REVIEW.text || undefined,
      supervisorReviewText: sections.SUPERVISOR_REVIEW.text || undefined,
      surpriseInspectionText: sections.SURPRISE_INSPECTION.text || undefined,
      interviewText: sections.DIRECT_INTERVIEW.text || undefined,
      storeEngagementText: sections.STORE_ENGAGEMENT.text || undefined,
      attachments,
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

      {EVALUATION_GROUPS.map((group) => (
        <div key={group.title} className="grid gap-3 rounded-lg border p-4">
          <p className="text-base font-semibold">{group.title}</p>

          {group.numericFields.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {group.numericFields.map((f) => (
                <div key={f.key} className="grid gap-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <Input
                    id={f.key}
                    type="number"
                    value={numeric[f.key]}
                    onChange={(e) => setNumeric((n) => ({ ...n, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {group.sections.map((s) => (
            <div key={s.section} className="grid gap-3 rounded-lg border p-3">
              <p className="text-sm font-medium">{s.label}</p>
              {s.hasText && (
                <Textarea
                  placeholder="Nhận xét..."
                  value={sections[s.section].text}
                  onChange={(e) => updateSection(s.section, { text: e.target.value })}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <MultiFileUploadField
                  label="Ảnh"
                  accept="image/*"
                  folder="evaluations"
                  files={sections[s.section].images}
                  onChange={(images) => updateSection(s.section, { images })}
                />
                {s.allowVideo && (
                  <MultiFileUploadField
                    label="Video"
                    accept="video/*"
                    folder="evaluations"
                    files={sections[s.section].videos}
                    onChange={(videos) => updateSection(s.section, { videos })}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </CrudFormDialog>
  );
}
