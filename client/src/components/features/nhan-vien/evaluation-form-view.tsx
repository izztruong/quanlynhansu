'use client';

import { useState } from 'react';
import { ImageIcon, Video } from 'lucide-react';
import { MediaGalleryDialog } from '@/components/ui/media-gallery-dialog';
import { EVALUATION_SECTIONS } from '@/lib/evaluation-sections';
import type { EvaluationAttachment, EvaluationCriteria, EvaluationForm } from '@/types';

function formatNumber(value: number | null) {
  return value === null ? '-' : value.toLocaleString('vi-VN');
}

export function EvaluationFormView({ form }: { form: EvaluationForm }) {
  const [gallery, setGallery] = useState<{ title: string; attachments: EvaluationAttachment[] } | null>(
    null
  );

  // A criteria can carry attachments without a text/number answer (uploading
  // a photo but leaving the field blank), so collect from both sides —
  // keying off answers alone would hide those attachments entirely.
  const criteriaById = new Map<string, EvaluationCriteria>();
  for (const a of form.answers) criteriaById.set(a.criteriaId, a.criteria);
  for (const att of form.attachments) criteriaById.set(att.criteriaId, att.criteria);

  const groups = EVALUATION_SECTIONS.map((group) => {
    const rows = [...criteriaById.values()]
      .filter((criteria) => criteria.section === group.value)
      .map((criteria) => ({
        criteria,
        answer: form.answers.find((a) => a.criteriaId === criteria.id) ?? null,
        images: form.attachments.filter((att) => att.criteriaId === criteria.id && att.type === 'IMAGE'),
        videos: form.attachments.filter((att) => att.criteriaId === criteria.id && att.type === 'VIDEO'),
      }))
      .sort((a, b) => a.criteria.order - b.criteria.order);
    return { ...group, rows };
  });

  const hasAnyContent = groups.some((g) => g.rows.length > 0);

  if (!hasAnyContent) {
    return <p className="text-sm text-muted-foreground">Phiếu chưa có nội dung</p>;
  }

  return (
    <div className="grid min-w-0 gap-5">
      {groups
        .filter((g) => g.rows.length > 0)
        .map((group) => (
          <div key={group.value} className="min-w-0">
            <p className="mb-2 text-base font-semibold">{group.label}</p>
            <div className="grid min-w-0 gap-2 pl-1">
              {group.rows.map(({ criteria, answer, images, videos }) => {
                const value =
                  criteria.inputType === 'NUMBER'
                    ? formatNumber(answer?.numberValue ?? null)
                    : (answer?.textValue ?? '');
                const hasValue = criteria.inputType === 'NUMBER' ? value !== '-' : value !== '';

                return (
                  <div key={criteria.id} className="min-w-0 break-words text-sm">
                    <span className="text-muted-foreground">{criteria.name}: </span>
                    {hasValue && (
                      <span
                        className={
                          criteria.inputType === 'NUMBER'
                            ? 'font-medium'
                            : 'whitespace-pre-wrap break-words'
                        }
                      >
                        {value}{' '}
                      </span>
                    )}
                    {images.length > 0 && (
                      <button
                        type="button"
                        className="ml-1 inline-flex items-center gap-1 align-middle text-xs font-medium text-primary hover:underline"
                        onClick={() => setGallery({ title: `${criteria.name} — Ảnh`, attachments: images })}
                      >
                        <ImageIcon className="size-3.5" />
                        Xem ảnh ({images.length})
                      </button>
                    )}
                    {videos.length > 0 && (
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center gap-1 align-middle text-xs font-medium text-primary hover:underline"
                        onClick={() => setGallery({ title: `${criteria.name} — Video`, attachments: videos })}
                      >
                        <Video className="size-3.5" />
                        Xem video ({videos.length})
                      </button>
                    )}
                    {!hasValue && images.length === 0 && videos.length === 0 && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                );
              })}
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
