'use client';

import { Check, ChevronDown, Minus } from 'lucide-react';
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

function code(resource: string, action: string) {
  return `${resource}.${action}`;
}

// Một quyền thì hiện tên quyền đó, đủ hết thì "Toàn quyền" — nhìn danh sách
// là biết ngay chức vụ được tới đâu mà không phải mở dropdown.
function actionLabel(granted: string[]) {
  if (granted.length === 0) return 'Không có quyền';
  if (granted.length === ACTIONS.length) return 'Toàn quyền';
  if (granted.length === 1) return ACTIONS.find((a) => a.action === granted[0])!.label;
  return 'Tuỳ chỉnh';
}

/** Ô ba trạng thái: đủ / một phần / trống. Bấm vào là cấp đủ hoặc bỏ hết. */
function TriStateBox({
  state,
  disabled,
  onClick,
}: {
  state: 'all' | 'some' | 'none';
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <span
      role="checkbox"
      aria-checked={state === 'all' ? true : state === 'some' ? 'mixed' : false}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-white',
        state === 'all' && 'border-blue-600 bg-blue-600',
        state === 'some' && 'border-orange-500 bg-orange-500',
        state === 'none' && 'border-input bg-transparent',
        disabled ? 'cursor-default opacity-60' : 'cursor-pointer'
      )}
    >
      {state === 'all' && <Check className="size-3" strokeWidth={3} />}
      {state === 'some' && <Minus className="size-3" strokeWidth={3} />}
    </span>
  );
}

interface Props {
  resources: PermissionResource[];
  /** Danh sách mã quyền, vd ["EMPLOYEES.VIEW", "EMPLOYEES.SCOPE_BRANCH"]. */
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function PermissionPicker({ resources, value, onChange, disabled }: Props) {
  const grantedActions = (resource: string) =>
    ACTIONS.filter((a) => value.includes(code(resource, a.action))).map((a) => a.action);

  const setActions = (resource: string, actions: string[]) => {
    const keep = value.filter((c) => !ACTIONS.some((a) => c === code(resource, a.action)));
    onChange([...keep, ...actions.map((a) => code(resource, a))].sort());
  };

  const toggleAction = (resource: string, action: string, checked: boolean) => {
    const current = grantedActions(resource);
    setActions(resource, checked ? [...current, action] : current.filter((a) => a !== action));
  };

  // Ba mức phạm vi xếp thang, chọn một trong ba nên chỉ lưu đúng một mã;
  // mức hẹp nhất biểu diễn bằng việc không lưu mã nào.
  const setScope = (scopeCodes: string[], picked: string | null) => {
    const keep = value.filter((c) => !scopeCodes.includes(c));
    onChange((picked ? [...keep, picked] : keep).sort());
  };

  return (
    <div className="divide-y rounded-lg border">
      {resources.map((r) => {
        const granted = grantedActions(r.resource);
        const state = granted.length === 0 ? 'none' : granted.length === ACTIONS.length ? 'all' : 'some';

        const scopes = r.scopes ?? [];
        const scopeCodes = scopes.map((s) => s.code).filter((c): c is string => c !== null);
        const currentScope = scopeCodes.find((c) => value.includes(c)) ?? null;
        const scopeLabel = scopes.find((s) => s.code === currentScope)?.label;

        return (
          <div key={r.resource} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="min-w-0 truncate text-sm">{r.label}</span>

            {/* Ô ba trạng thái để ngoài trigger: lồng vào trong thì cú bấm của
                nó cũng bung dropdown, vì Base UI mở menu ngay từ pointerdown. */}
            <div
              className={cn(
                'flex w-56 shrink-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm',
                disabled && 'opacity-60'
              )}
            >
              <TriStateBox
                state={state}
                disabled={disabled}
                onClick={() =>
                  setActions(r.resource, state === 'all' ? [] : ACTIONS.map((a) => a.action))
                }
              />

              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={disabled}
                  className={cn(
                    'flex min-w-0 flex-1 items-center gap-2 text-left',
                    !disabled && 'cursor-pointer'
                  )}
                >
                  <span
                    className={cn('min-w-0 flex-1 truncate', state === 'none' && 'text-muted-foreground')}
                  >
                    {actionLabel(granted)}
                    {scopeLabel && granted.length > 0 && (
                      <span className="text-muted-foreground"> · {scopeLabel}</span>
                    )}
                  </span>
                  <ChevronDown className="size-4 shrink-0" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="grid gap-0.5">
                    {ACTIONS.map((a) => {
                      const id = `${r.resource}-${a.action}`;
                      return (
                        <div
                          key={a.action}
                          className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-muted"
                        >
                          <Checkbox
                            id={id}
                            checked={granted.includes(a.action)}
                            onCheckedChange={(checked) =>
                              toggleAction(r.resource, a.action, checked === true)
                            }
                          />
                          <Label htmlFor={id} className="flex-1 cursor-pointer font-normal">
                            {a.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>

                  {scopes.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <p className="px-1.5 pb-1 text-xs text-muted-foreground">Phạm vi dữ liệu</p>
                      <div className="grid gap-0.5">
                        {scopes.map((s) => {
                          const id = `${r.resource}-scope-${s.code ?? 'self'}`;
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-muted"
                            >
                              <input
                                type="radio"
                                id={id}
                                name={`${r.resource}-scope`}
                                className="size-4 accent-blue-600"
                                checked={currentScope === s.code}
                                onChange={() => setScope(scopeCodes, s.code)}
                              />
                              <Label htmlFor={id} className="flex-1 cursor-pointer font-normal">
                                {s.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
