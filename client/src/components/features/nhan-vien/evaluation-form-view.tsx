'use client';

import { useState } from 'react';
import { ImageIcon, Video } from 'lucide-react';
import { MediaGalleryDialog } from '@/components/ui/media-gallery-dialog';
import { EVALUATION_GROUPS } from '@/lib/evaluation-sections';
import type { EvaluationAttachment, EvaluationForm, EvaluationSection } from '@/types';

const textFieldBySection: Record<EvaluationSection, keyof EvaluationForm | null> = {
  RECENT_TEST: 'recentTestNote',
  MANAGER_REVIEW: 'managerReviewText',
  SUPERVISOR_REVIEW: 'supervisorReviewText',
  SURPRISE_INSPECTION: 'surpriseInspectionText',
  DIRECT_INTERVIEW: 'interviewText',
  STORE_ENGAGEMENT: 'storeEngagementText',
};

function formatNumber(value: number | null) {
  return value === null ? '-' : value.toLocaleString('vi-VN');
}

export function EvaluationFormView({ form }: { form: EvaluationForm }) {
  const [gallery, setGallery] = useState<{ title: string; attachments: EvaluationAttachment[] } | null>(
    null
  );

  const groups = EVALUATION_GROUPS.map((group) => {
    const sections = group.sections.map((s) => {
      const images = form.attachments.filter((a) => a.section === s.section && a.type === 'IMAGE');
      const videos = form.attachments.filter((a) => a.section === s.section && a.type === 'VIDEO');
      const textField = textFieldBySection[s.section];
      const text = textField ? (form[textField] as string | null) : null;
      return { ...s, images, videos, text };
    });
    return { ...group, sections };
  });

  const hasAnyContent =
    hasNumericValue(form) ||
    groups.some((g) => g.sections.some((s) => s.text || s.images.length > 0 || s.videos.length > 0));

  if (!hasAnyContent) {
    return <p className="text-sm text-muted-foreground">Phiếu chưa có nội dung</p>;
  }

  return (
    <div className="grid min-w-0 gap-5">
      {groups.map((group) => (
        <div key={group.title} className="min-w-0">
          <p className="mb-2 text-base font-semibold">{group.title}</p>
          <div className="grid min-w-0 gap-2 pl-1">
            {group.numericFields.map((f) => (
              <div key={f.key} className="flex min-w-0 flex-wrap justify-between gap-x-4 text-sm">
                <span className="break-words text-muted-foreground">{f.label}</span>
                <span className="shrink-0 font-medium">{formatNumber(form[f.key])}</span>
              </div>
            ))}

            {group.sections.map((s) => (
              <div key={s.section} className="min-w-0 break-words text-sm">
                <span className="text-muted-foreground">{s.label}: </span>
                {s.text && <span className="whitespace-pre-wrap break-words">{s.text} </span>}
                {s.images.length > 0 && (
                  <button
                    type="button"
                    className="ml-1 inline-flex items-center gap-1 align-middle text-xs font-medium text-primary hover:underline"
                    onClick={() => setGallery({ title: `${s.label} — Ảnh`, attachments: s.images })}
                  >
                    <ImageIcon className="size-3.5" />
                    Xem ảnh ({s.images.length})
                  </button>
                )}
                {s.videos.length > 0 && (
                  <button
                    type="button"
                    className="ml-2 inline-flex items-center gap-1 align-middle text-xs font-medium text-primary hover:underline"
                    onClick={() => setGallery({ title: `${s.label} — Video`, attachments: s.videos })}
                  >
                    <Video className="size-3.5" />
                    Xem video ({s.videos.length})
                  </button>
                )}
                {!s.text && s.images.length === 0 && s.videos.length === 0 && (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <MediaGalleryDialog
        open={gallery !== null}
        onOpenChange={(open) => !open && setGallery(null)}
        title={gallery?.title ?? ''}
        attachments={gallery?.attachments ?? []}
      />
    </div>
  );
}

function hasNumericValue(form: EvaluationForm) {
  return (
    form.shiftsWorkedInMonth !== null ||
    form.lateMinutesInMonth !== null ||
    form.shiftChangeCount !== null ||
    form.missedCheckInOutCount !== null ||
    form.disciplinaryReportCount !== null
  );
}
