'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';

interface Props {
  label: string;
  imageUrl: string | null;
  folder: string;
  onUploaded: (key: string, url: string) => void;
}

export function ImageUploadField({ label, imageUrl, folder, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.upload<{ key: string; url: string }>(file, folder);
      onUploaded(result.key, result.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tải ảnh lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30 disabled:opacity-60"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={label} className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <ImagePlus className="size-5" />
            <span className="text-xs">{uploading ? 'Đang tải lên...' : 'Chọn ảnh'}</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
