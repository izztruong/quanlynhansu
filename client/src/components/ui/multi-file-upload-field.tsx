'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plus, X, Video } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';

export interface UploadedFile {
  key: string;
  url: string;
}

interface Props {
  label: string;
  accept: 'image/*' | 'video/*';
  folder: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

export function MultiFileUploadField({ label, accept, folder, files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isImage = accept === 'image/*';

  const handleFiles = async (fileList: FileList) => {
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(fileList).map((file) => api.upload<UploadedFile>(file, folder))
      );
      onChange([...files, ...uploaded]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tải file lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => (
          <div
            key={f.key}
            className="relative flex size-16 items-center justify-center overflow-hidden rounded-lg border bg-muted/30"
          >
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <Video className="size-4" />
                <span className="text-[10px]">Video {i + 1}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onChange(files.filter((x) => x.key !== f.key))}
              className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex size-16 items-center justify-center rounded-lg border border-dashed text-muted-foreground disabled:opacity-60"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
