'use client';

import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleSelect } from '@/components/ui/simple-select';
import { addWeeks, getWeekNumber } from '@/lib/date';
import type { Branch, Department } from '@/types';

interface Props {
  referenceDate: Date;
  onReferenceDateChange: (date: Date) => void;
  branchId: string;
  onBranchIdChange: (id: string) => void;
  branches: Branch[];
  departmentId: string;
  onDepartmentIdChange: (id: string) => void;
  departments: Department[];
  onRefresh: () => void;
}

export function WeekFilterBar({
  referenceDate,
  onReferenceDateChange,
  branchId,
  onBranchIdChange,
  branches,
  departmentId,
  onDepartmentIdChange,
  departments,
  onRefresh,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <SimpleSelect
        value={branchId}
        onValueChange={onBranchIdChange}
        className="w-56"
        options={[
          { value: 'all', label: 'Tất cả chi nhánh' },
          ...branches.map((b) => ({ value: b.id, label: b.name })),
        ]}
      />

      <SimpleSelect
        value={departmentId}
        onValueChange={onDepartmentIdChange}
        className="w-48"
        options={[
          { value: 'all', label: 'Tất cả bộ phận' },
          ...departments.map((d) => ({ value: d.id, label: d.name })),
        ]}
      />

      <div className="flex items-center gap-1 rounded-md border px-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onReferenceDateChange(addWeeks(referenceDate, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-32 text-center text-sm font-medium">
          Tuần {getWeekNumber(referenceDate)} năm {referenceDate.getFullYear()}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onReferenceDateChange(addWeeks(referenceDate, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Button type="button" onClick={onRefresh}>
        Lọc
      </Button>
      <Button type="button" variant="outline" size="icon" onClick={() => onReferenceDateChange(new Date())}>
        <RotateCw className="size-4" />
      </Button>
    </div>
  );
}
