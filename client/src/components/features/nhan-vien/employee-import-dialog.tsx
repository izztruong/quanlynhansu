'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

interface ImportRowResult {
  row: number;
  code: string;
  status: 'created' | 'updated' | 'error';
  message?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function EmployeeImportDialog({ open, onOpenChange, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [results, setResults] = useState<ImportRowResult[] | null>(null);

  const reset = () => {
    setFile(null);
    setResults(null);
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await api.downloadFile('/employees/import-template', 'mau-nhap-nhan-vien.xlsx');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tải file mẫu thất bại');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.uploadFile<ImportRowResult[]>('/employees/import', file);
      setResults(data);
      onImported();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nhập file thất bại');
    } finally {
      setUploading(false);
    }
  };

  const createdCount = results?.filter((r) => r.status === 'created').length ?? 0;
  const updatedCount = results?.filter((r) => r.status === 'updated').length ?? 0;
  const errorRows = results?.filter((r) => r.status === 'error') ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhập nhân viên từ Excel</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 px-4 py-4">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60"
          >
            <Download className="size-4" />
            {downloadingTemplate ? 'Đang tải...' : 'Tải file mẫu'}
          </button>

          {!results && (
            <div className="grid gap-2">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
              >
                {file ? file.name : 'Chọn file Excel (.xlsx)'}
              </button>
            </div>
          )}

          {results && (
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  Tạo mới {createdCount}
                </span>
                <span className="inline-flex items-center gap-1.5 text-blue-600">
                  <CheckCircle2 className="size-4" />
                  Cập nhật {updatedCount}
                </span>
                {errorRows.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-destructive">
                    <XCircle className="size-4" />
                    Lỗi {errorRows.length}
                  </span>
                )}
              </div>

              {errorRows.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <tbody>
                      {errorRows.map((r) => (
                        <tr key={r.row} className="border-b last:border-b-0">
                          <td className="whitespace-nowrap px-2 py-1.5 align-top text-muted-foreground">
                            Dòng {r.row}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 align-top text-muted-foreground">
                            {r.code}
                          </td>
                          <td className="px-2 py-1.5 align-top text-destructive">{r.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {results ? (
            <Button onClick={() => onOpenChange(false)}>Đóng</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? 'Đang tải lên...' : 'Tải lên'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
