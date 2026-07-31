'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { MoreVertical, RefreshCcw, Briefcase, Building2, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import { selectablePositions } from '@/lib/position-utils';
import { activeOnly } from '@/lib/record-utils';
import type { Branch, Employee, Position } from '@/types';

type DialogKind = 'type' | 'position' | 'branch' | 'terminate' | null;

interface Props {
  employee: Employee;
  branches: Branch[];
  positions: Position[];
  onChanged: () => void;
}

export function EmployeeActionsMenu({ employee, branches, positions, onChanged }: Props) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [employeeType, setEmployeeType] = useState(employee.employeeType);
  const [salaryRate, setSalaryRate] = useState(String(employee.salaryRate ?? ''));
  const [positionId, setPositionId] = useState(employee.position.id);
  const [branchId, setBranchId] = useState(employee.branch.id);
  const [terminating, setTerminating] = useState(false);

  const closeAndReset = () => {
    setDialog(null);
    setEmployeeType(employee.employeeType);
    setSalaryRate(String(employee.salaryRate ?? ''));
    setPositionId(employee.position.id);
    setBranchId(employee.branch.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-md hover:bg-muted">
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDialog('type')}>
            <RefreshCcw className="size-4" />
            Thay đổi loại nhân viên
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog('position')}>
            <Briefcase className="size-4" />
            Thay đổi chức vụ
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog('branch')}>
            <Building2 className="size-4" />
            Đổi chi nhánh làm việc
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDialog('terminate')}>
            <UserX className="size-4" />
            Cho nghỉ việc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CrudFormDialog
        open={dialog === 'type'}
        onOpenChange={(open) => !open && closeAndReset()}
        title="Thay đổi loại nhân viên"
        onSubmit={async () => {
          await api.patch(`/employees/${employee.id}/type`, {
            employeeType,
            salaryRate: salaryRate === '' ? undefined : Number(salaryRate),
          });
          toast.success('Đã cập nhật loại nhân viên');
          onChanged();
        }}
      >
        <div className="grid gap-2">
          <Label>Loại nhân viên</Label>
          <SimpleSelect
            value={employeeType}
            onValueChange={(v) => setEmployeeType(v as typeof employeeType)}
            options={[
              { value: 'FULL_TIME', label: 'Full-time' },
              { value: 'PART_TIME', label: 'Part-time' },
            ]}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="menu-salary-rate">
            {employeeType === 'PART_TIME' ? 'Mức lương (VNĐ/giờ)' : 'Mức lương (VNĐ/tháng)'}
          </Label>
          <Input
            id="menu-salary-rate"
            type="number"
            value={salaryRate}
            onChange={(e) => setSalaryRate(e.target.value)}
          />
        </div>
      </CrudFormDialog>

      <CrudFormDialog
        open={dialog === 'position'}
        onOpenChange={(open) => !open && closeAndReset()}
        title="Thay đổi chức vụ"
        onSubmit={async () => {
          await api.patch(`/employees/${employee.id}/position`, { positionId });
          toast.success('Đã cập nhật chức vụ');
          onChanged();
        }}
      >
        <div className="grid gap-2">
          <Label>Chức vụ</Label>
          <SimpleSelect
            value={positionId}
            onValueChange={setPositionId}
            options={selectablePositions(positions).map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>
      </CrudFormDialog>

      <CrudFormDialog
        open={dialog === 'branch'}
        onOpenChange={(open) => !open && closeAndReset()}
        title="Đổi chi nhánh làm việc"
        onSubmit={async () => {
          await api.patch(`/employees/${employee.id}/branch`, { branchId });
          toast.success('Đã cập nhật chi nhánh');
          onChanged();
        }}
      >
        <div className="grid gap-2">
          <Label>Chi nhánh</Label>
          <SimpleSelect
            value={branchId}
            onValueChange={setBranchId}
            options={activeOnly(branches).map((b) => ({ value: b.id, label: b.name }))}
          />
        </div>
      </CrudFormDialog>

      <AlertDialog open={dialog === 'terminate'} onOpenChange={(open) => !open && closeAndReset()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cho nhân viên nghỉ việc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn cho "{employee.name}" nghỉ việc? Nhân viên sẽ được chuyển sang
              trạng thái đã nghỉ việc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={terminating}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              disabled={terminating}
              onClick={async () => {
                setTerminating(true);
                try {
                  await api.patch(`/employees/${employee.id}/terminate`);
                  toast.success('Đã cho nhân viên nghỉ việc');
                  onChanged();
                  setDialog(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
                } finally {
                  setTerminating(false);
                }
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
