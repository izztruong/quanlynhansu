import { Construction } from 'lucide-react';

export function ComingSoon({ description }: { description?: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card text-center">
      <Construction className="size-10 text-muted-foreground" />
      <p className="text-sm font-medium">Tính năng đang được phát triển</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
