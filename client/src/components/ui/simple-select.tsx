'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SimpleSelectOption {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SimpleSelectOption[];
  placeholder?: string;
  className?: string;
}

export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: SimpleSelectProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>{selected?.label ?? placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
