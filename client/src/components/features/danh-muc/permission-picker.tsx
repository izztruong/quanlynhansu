'use client';

import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PermissionResource } from '@/types';

const ACTIONS = [
  { action: 'VIEW', label: 'Xem' },
  { action: 'ADD', label: 'Thêm' },
  { action: 'EDIT', label: 'Sửa' },
  { action: 'DELETE', label: 'Xoá' },
] as const;

const PRESETS = [
  { key: 'none', label: 'Không có quyền', actions: [] as string[] },
  { key: 'view', label: 'Chỉ xem', actions: ['VIEW'] },
  { key: 'full', label: 'Toàn quyền', actions: ACTIONS.map((a) => a.action) },
] as const;

function code(resource: string, action: string) {
  return `${resource}.${action}`;
}

function summaryLabel(granted: string[]) {
  if (granted.length === 0) return 'Không có quyền';
  if (granted.length === ACTIONS.length) return 'Toàn quyền';
  if (granted.length === 1 && granted[0] === 'VIEW') return 'Chỉ xem';
  return 'Tuỳ chỉnh';
}

interface Props {
  resources: PermissionResource[];
  /** Danh sách mã quyền, vd ["EMPLOYEES.VIEW", "EMPLOYEES.ADD"]. */
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function PermissionPicker({ resources, value, onChange, disabled }: Props) {
  const grantedActions = (resource: string) =>
    ACTIONS.filter((a) => value.includes(code(resource, a.action))).map((a) => a.action);

  const setActions = (resource: string, actions: string[]) => {
    const others = value.filter((c) => !c.startsWith(`${resource}.`));
    onChange([...others, ...actions.map((a) => code(resource, a))].sort());
  };

  const toggleAction = (resource: string, action: string, checked: boolean) => {
    const current = grantedActions(resource);
    setActions(resource, checked ? [...current, action] : current.filter((a) => a !== action));
  };

  return (
    <div className="divide-y rounded-lg border">
      {resources.map((r) => {
        const granted = grantedActions(r.resource);
        const label = summaryLabel(granted);

        return (
          <div key={r.resource} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="min-w-0 truncate text-sm">{r.label}</span>

            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={disabled}
                className={cn(
                  'flex w-44 shrink-0 items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm',
                  disabled ? 'opacity-60' : 'hover:bg-muted',
                  label === 'Không có quyền' && 'text-muted-foreground'
                )}
              >
                {label}
                <ChevronDown className="size-4 shrink-0" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="grid gap-1 pb-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      className="rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      onClick={() => setActions(r.resource, [...preset.actions])}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                  {ACTIONS.map((a) => {
                    const id = `${r.resource}-${a.action}`;
                    return (
                      <div key={a.action} className="flex items-center gap-2">
                        <Checkbox
                          id={id}
                          checked={granted.includes(a.action)}
                          onCheckedChange={(checked) =>
                            toggleAction(r.resource, a.action, checked === true)
                          }
                        />
                        <Label htmlFor={id} className="font-normal">
                          {a.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}
