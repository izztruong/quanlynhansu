'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Heart, Tag, Mail, Pencil } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { EmployeeStatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs';
import { EmployeeSidebarActions } from '@/components/features/nhan-vien/employee-sidebar-actions';
import { PersonalInfoFormDialog } from '@/components/features/nhan-vien/personal-info-form-dialog';
import { IdCardFormDialog } from '@/components/features/nhan-vien/id-card-form-dialog';
import { EvaluationSummaryCard } from '@/components/features/nhan-vien/evaluation-summary-card';
import type { Branch, Employee, Position } from '@/types';

const genderLabel: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('vi-VN');
}

function tenureDays(employee: Employee) {
  const start = new Date(employee.hireDate ?? employee.createdAt);
  const days = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(days, 0);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="size-3.5" />
          Cập nhật
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

export default function NhanVienDetailPage() {
  usePageTitle('Thông tin nhân viên');
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);

  const loadEmployee = useCallback(() => {
    return api
      .get<Employee>(`/employees/${id}`)
      .then(setEmployee)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  useEffect(() => {
    api.get<Branch[]>('/branches').then(setBranches).catch(() => {});
    api.get<Position[]>('/positions').then(setPositions).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Link
        href="/nhan-vien"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Quay lại danh sách nhân viên
      </Link>

      {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}

      {!loading && !employee && (
        <p className="text-sm text-muted-foreground">Không tìm thấy nhân viên</p>
      )}

      {employee && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
                {employee.name.slice(0, 1)}
              </div>
              <h2 className="mt-3 text-lg font-semibold">{employee.name}</h2>
              <p className="text-sm text-muted-foreground">{employee.position.name}</p>
              <div className="mt-2">
                <EmployeeStatusBadge status={employee.status} />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t pt-4 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-muted-foreground" />
                <span>{tenureDays(employee)} ngày làm việc</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-muted-foreground" />
                <span>Mã nhân viên {employee.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="truncate">{employee.email ?? '-'}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <EmployeeSidebarActions
                employee={employee}
                branches={branches}
                positions={positions}
                onChanged={loadEmployee}
              />
            </div>
          </div>

          <Tabs defaultValue="personal" className="min-w-0">
            <TabsList className="mb-4">
              <TabsTab value="personal">Cá nhân</TabsTab>
              <TabsTab value="work">Công việc</TabsTab>
              <TabsTab value="history">Lịch sử hoạt động</TabsTab>
            </TabsList>

            <TabsPanel value="personal" className="flex flex-col gap-4">
              <SectionCard title="Thông tin cơ bản" onEdit={() => setPersonalInfoOpen(true)}>
                <Field label="Họ tên" value={employee.name} />
                <Field label="Email" value={employee.email ?? '-'} />
                <Field label="Số điện thoại" value={employee.phone ?? '-'} />
                <Field label="Ngày sinh" value={formatDate(employee.dateOfBirth)} />
                <Field label="Giới tính" value={employee.gender ? genderLabel[employee.gender] : '-'} />
                <Field label="Nơi thường trú" value={employee.permanentAddress ?? '-'} />
                <Field label="Nơi ở hiện tại" value={employee.currentAddress ?? '-'} />
                <Field
                  label="Tài khoản ngân hàng"
                  value={
                    employee.bankName || employee.bankAccountNumber
                      ? `${employee.bankName ?? '-'}${
                          employee.bankAccountNumber ? ` - ${employee.bankAccountNumber}` : ''
                        }`
                      : '-'
                  }
                />
              </SectionCard>

              <SectionCard title="Thông tin căn cước" onEdit={() => setIdCardOpen(true)}>
                <Field label="Số căn cước công dân" value={employee.idNumber ?? '-'} />
                <Field label="Ngày cấp" value={formatDate(employee.idIssueDate)} />
                <Field label="Nơi cấp" value={employee.idIssuePlace ?? '-'} />
                <div className="col-span-2 grid grid-cols-2 gap-4 md:col-span-3 md:max-w-md">
                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">Ảnh mặt trước</p>
                    {employee.idFrontImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={employee.idFrontImageUrl}
                        alt="Ảnh mặt trước CCCD"
                        className="h-28 w-full rounded-lg border object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">Ảnh mặt sau</p>
                    {employee.idBackImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={employee.idBackImageUrl}
                        alt="Ảnh mặt sau CCCD"
                        className="h-28 w-full rounded-lg border object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </TabsPanel>

            <TabsPanel value="work" className="flex flex-col gap-4">
              <div className="rounded-lg border bg-card p-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
                  <Field label="Chi nhánh" value={employee.branch.name} />
                  <Field label="Bộ phận" value={employee.department.name} />
                  <Field label="Chức vụ" value={employee.position.name} />
                  <Field label="Level" value={employee.level?.name ?? '-'} />
                  <Field
                    label="Loại nhân viên"
                    value={employee.employeeType === 'FULL_TIME' ? 'Full-time' : 'Part-time'}
                  />
                  <Field
                    label={employee.employeeType === 'PART_TIME' ? 'Mức lương (VNĐ/giờ)' : 'Mức lương (VNĐ/tháng)'}
                    value={employee.salaryRate !== null ? employee.salaryRate.toLocaleString('vi-VN') : '-'}
                  />
                  <Field label="Ngày vào làm" value={formatDate(employee.hireDate ?? employee.createdAt)} />
                </div>
              </div>

              <EvaluationSummaryCard employeeId={employee.id} />
            </TabsPanel>

            <TabsPanel value="history">
              <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                Chưa có lịch sử hoạt động
              </div>
            </TabsPanel>
          </Tabs>

          <PersonalInfoFormDialog
            open={personalInfoOpen}
            onOpenChange={setPersonalInfoOpen}
            employee={employee}
            onChanged={loadEmployee}
          />
          <IdCardFormDialog
            open={idCardOpen}
            onOpenChange={setIdCardOpen}
            employee={employee}
            onChanged={loadEmployee}
          />
        </div>
      )}
    </div>
  );
}
