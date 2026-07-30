'use client';

import { X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectChipsProps {
  options: MultiSelectOption[];
  /** Required unless hideAllOption is set */
  allLabel?: string;
  /** null = "all" selected (no restriction). Ignored when hideAllOption is set. */
  value: string[] | null;
  onChange: (value: string[] | null) => void;
  className?: string;
  /** Hide the "select all" checkbox/chip — value is always treated as a plain array. */
  hideAllOption?: boolean;
  placeholder?: string;
}

export function MultiSelectChips({
  options,
  allLabel,
  value,
  onChange,
  className,
  hideAllOption = false,
  placeholder = 'Chưa chọn',
}: MultiSelectChipsProps) {
  const isAll = !hideAllOption && value === null;
  const selectedIds = value ?? [];
  const chips = isAll
    ? [{ value: '__all__', label: allLabel ?? '' }]
    : options.filter((o) => selectedIds.includes(o.value));

  const removeChip = (chipValue: string) => {
    if (chipValue === '__all__') {
      onChange([]);
      return;
    }
    onChange(selectedIds.filter((v) => v !== chipValue));
  };

  const toggleAll = (checked: boolean) => {
    onChange(checked ? null : []);
  };

  const toggleOption = (optionValue: string, checked: boolean) => {
    onChange(checked ? [...selectedIds, optionValue] : selectedIds.filter((v) => v !== optionValue));
  };

  return (
    <div
      className={cn(
        'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5',
        className
      )}
    >
      {chips.length === 0 && <span className="text-sm text-muted-foreground">{placeholder}</span>}
      {chips.map((chip) => (
        <span
          key={chip.value}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => removeChip(chip.value)}
            className="rounded-full hover:bg-primary/20"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto flex size-6 shrink-0 items-center justify-center rounded hover:bg-muted">
          <ChevronDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-64 min-w-56 overflow-y-auto">
          {!hideAllOption && (
            <>
              <DropdownMenuCheckboxItem checked={isAll} onCheckedChange={toggleAll}>
                {allLabel}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
            </>
          )}
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={!isAll && selectedIds.includes(option.value)}
              onCheckedChange={(checked) => toggleOption(option.value, checked)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
