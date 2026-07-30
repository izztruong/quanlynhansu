'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lightbox } from '@/components/ui/lightbox';
import type { EvaluationAttachment } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  attachments: EvaluationAttachment[];
}

export function MediaGalleryDialog({ open, onOpenChange, title, attachments }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[70vh] grid-cols-2 gap-3 overflow-y-auto p-4">
          {attachments.map((a, i) =>
            a.type === 'IMAGE' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={a.id}
                src={a.url}
                alt=""
                className="aspect-square w-full cursor-zoom-in rounded-lg border object-cover"
                onClick={() => setLightboxIndex(i)}
              />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                key={a.id}
                src={a.url}
                muted
                playsInline
                className="aspect-square w-full cursor-zoom-in rounded-lg border object-cover"
                onClick={() => setLightboxIndex(i)}
              />
            )
          )}
        </div>
      </DialogContent>

      {lightboxIndex !== null && (
        <Lightbox
          attachments={attachments}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Dialog>
  );
}
