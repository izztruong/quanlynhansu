'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, Clock, Search, Plus, Download, Upload, ChevronDown } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { usePagination } from '@/hooks/use-pagination';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { EmployeeStatusBadge } from '@/components/ui/status-badge';
import { EmployeeActionsMenu } from '@/components/features/nhan-vien/employee-actions-menu';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Branch, Department, Employee, Level, Position } from '@/types';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmployeeFormDialog } from '@/components/features/nhan-vien/employee-form-dialog';
import { EmployeeImportDialog } from '@/components/features/nhan-vien/employee-import-dialog';

const COL = {
  index: 48,
  employee: 240,
  actions: 120,
};

export default function NhanVienPage() {
  usePageTitle('Nhân viên');
  const { items: employees, loading, create, refresh } = useCrud<Employee>('/employees');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');
  const [employeeType, setEmployeeType] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { can } = useAuth();

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.downloadFile('/employees/export', 'nhan-vien.xlsx');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xuất file thất bại');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
    api.get<Position[]>('/positions').then(setPositions).catch(() => {});
    api.get<Level[]>('/levels').then(setLevels).catch(() => {});
  }, []);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch = !keyword || employee.name.toLowerCase().includes(keyword);
      const matchesBranch = branchId === 'all' || employee.branch.id === branchId;
      const matchesDepartment =
        departmentId === 'all' || employee.department.id === departmentId;
      const matchesEmployeeType = employeeType === 'all' || employee.employeeType === employeeType;
      return matchesSearch && matchesBranch && matchesDepartment && matchesEmployeeType;
    });
  }, [employees, search, branchId, departmentId, employeeType]);

  const { page, setPage, pageCount, pageItems: pageEmployees, totalCount, startIndex } =
    usePagination(filteredEmployees);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhân viên..."
            className="w-64 pl-8"
          />
        </div>
        <SimpleSelect
          value={branchId}
          onValueChange={setBranchId}
          className="w-56"
          options={[
            { value: 'all', label: 'Tất cả chi nhánh' },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <SimpleSelect
          value={departmentId}
          onValueChange={setDepartmentId}
          className="w-48"
          options={[
            { value: 'all', label: 'Tất cả bộ phận' },
            ...departments.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
        <SimpleSelect
          value={employeeType}
          onValueChange={setEmployeeType}
          className="w-48"
          options={[
            { value: 'all', label: 'Tất cả loại nhân viên' },
            { value: 'FULL_TIME', label: 'Full-time' },
            { value: 'PART_TIME', label: 'Part-time' },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-sm text-muted-foreground">
            Tổng số {totalCount} nhân viên
          </span>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Nhập & xuất excel
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {can('EMPLOYEES', 'create') && (
                  <DropdownMenuItem onClick={() => setImportOpen(true)}>
                    <Upload className="size-4" />
                    Nhập dữ liệu
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleExport} disabled={exporting}>
                  <Download className="size-4" />
                  {exporting ? 'Đang xuất...' : 'Xuất dữ liệu'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {can('EMPLOYEES', 'create') && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Thêm mới
              </Button>
            )}
          </div>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse caption-bottom text-sm">
          <colgroup>
            <col style={{ width: COL.index }} />
            <col style={{ width: COL.employee }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: COL.actions }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead
                className="sticky left-0 z-20 bg-card"
                style={{ left: 0 }}
              >
                #
              </TableHead>
              <TableHead
                className="sticky z-20 bg-card"
                style={{ left: COL.index }}
              >
                Nhân viên
              </TableHead>
              <TableHead>Mã nhân viên</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Bộ phận</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="sticky right-0 z-20 bg-card text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}
            {!loading && totalCount === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  {employees.length === 0
                    ? 'Chưa có nhân viên'
                    : 'Không tìm thấy nhân viên phù hợp'}
                </TableCell>
              </TableRow>
            )}
            {pageEmployees.map((employee, index) => (
              <TableRow key={employee.id} className="group">
                <TableCell
                  className="sticky left-0 z-10 bg-card group-hover:bg-muted/50"
                  style={{ left: 0 }}
                >
                  {startIndex + index + 1}
                </TableCell>
                <TableCell
                  className="sticky z-10 bg-card group-hover:bg-muted/50"
                  style={{ left: COL.index }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {employee.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{employee.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {employee.email ?? '-'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="truncate">{employee.code}</TableCell>
                <TableCell>{employee.phone || '-'}</TableCell>
                <TableCell className="truncate">{employee.branch.name}</TableCell>
                <TableCell>{employee.department.name}</TableCell>
                <TableCell>{employee.position.name}</TableCell>
                <TableCell>{employee.level?.name ?? '-'}</TableCell>
                <TableCell>
                  <EmployeeStatusBadge status={employee.status} />
                </TableCell>
                <TableCell
                  className={cn('sticky right-0 z-10 bg-card group-hover:bg-muted/50')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/nhan-vien/${employee.id}`}
                      className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
                      title="Xem chi tiết"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                      title="Chấm công"
                    >
                      <Clock className="size-4" />
                    </button>
                    {can('EMPLOYEES', 'update') && (
                      <EmployeeActionsMenu
                        employee={employee}
                        branches={branches}
                        positions={positions}
                        onChanged={refresh}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <EmployeeFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        branches={branches}
        departments={departments}
        positions={positions}
        levels={levels}
        onSubmit={create}
      />

      <EmployeeImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={refresh} />
    </div>
  );
}
