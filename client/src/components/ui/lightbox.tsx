'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { EvaluationAttachment } from '@/types';

interface Props {
  attachments: EvaluationAttachment[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function Lightbox({ attachments, index, onIndexChange, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const goPrev = () => onIndexChange((index - 1 + attachments.length) % attachments.length);
  const goNext = () => onIndexChange((index + 1) % attachments.length);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, attachments.length]);

  if (!mounted) return null;

  const current = attachments[index];
  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
      >
        <X className="size-6" />
      </button>

      {attachments.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white sm:left-4"
          >
            <ChevronLeft className="size-7" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white sm:right-4"
          >
            <ChevronRight className="size-7" />
          </button>
        </>
      )}

      <div className="flex max-h-[90vh] max-w-[90vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {current.type === 'IMAGE' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={current.url}
            controls
            autoPlay
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        )}
      </div>

      {attachments.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/90">
          {index + 1} / {attachments.length}
        </div>
      )}
    </div>,
    document.body
  );
}
