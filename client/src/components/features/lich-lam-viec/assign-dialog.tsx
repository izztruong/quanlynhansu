'use client';

import { useState } from 'react';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Label } from '@/components/ui/label';

interface Option {
  id: string;
  label: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  options: Option[];
  onSubmit: (id: string) => Promise<void>;
}

export function AssignDialog({ open, onOpenChange, title, label, options, onSubmit }: Props) {
  const [selected, setSelected] = useState('');

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelected('');
        onOpenChange(next);
      }}
      title={title}
      onSubmit={async () => {
        if (!selected) return;
        await onSubmit(selected);
        setSelected('');
      }}
    >
      <div className="grid gap-2">
        <Label>{label}</Label>
        <SimpleSelect
          value={selected}
          onValueChange={setSelected}
          placeholder="Chọn..."
          options={options.map((o) => ({ value: o.id, label: o.label }))}
        />
      </div>
    </CrudFormDialog>
  );
}
