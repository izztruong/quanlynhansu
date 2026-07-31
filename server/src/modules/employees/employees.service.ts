import bcrypt from 'bcryptjs';
import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import { uploadsService } from '@/modules/uploads/uploads.service';
import { buildExportWorkbook, type ImportRow } from './employees.excel';
import type { CreateEmployeeInput, UpdateEmployeeInput } from './employees.dto';

const include = {
  branch: true,
  department: true,
  position: true,
  level: true,
};

// Matches the seed script's convention — an employee gains web/mobile login
// the moment an admin gives them an email, so they need a real password
// hash immediately; they can change it via "Bảo mật tài khoản" afterward.
const DEFAULT_PASSWORD = '123456';

// Date-only strings from the client ("YYYY-MM-DD") parse as UTC midnight per
// the JS spec, matching how @db.Date columns are normalized — do not use
// `new Date(y, m, d)` here, it would roll the date back a day in UTC+7.
function withParsedDates<T extends { dateOfBirth?: string; idIssueDate?: string; hireDate?: string }>(
  data: T
) {
  return {
    ...data,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    idIssueDate: data.idIssueDate ? new Date(data.idIssueDate) : undefined,
    hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
  };
}

// The R2 bucket is private, so a stored image key is only ever useful to a
// caller as a freshly signed URL — resolved on read, never persisted.
async function withImageUrls<T extends { idFrontImageKey: string | null; idBackImageKey: string | null }>(
  employee: T
) {
  const [idFrontImageUrl, idBackImageUrl] = await Promise.all([
    employee.idFrontImageKey ? uploadsService.getSignedUrl(employee.idFrontImageKey) : null,
    employee.idBackImageKey ? uploadsService.getSignedUrl(employee.idBackImageKey) : null,
  ]);
  return { ...employee, idFrontImageUrl, idBackImageUrl };
}

function parseEmployeeType(value: string): 'FULL_TIME' | 'PART_TIME' {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'FULL_TIME';
  if (normalized === 'full-time' || normalized === 'fulltime') return 'FULL_TIME';
  if (normalized === 'part-time' || normalized === 'parttime') return 'PART_TIME';
  throw new Error(`Loại nhân viên không hợp lệ: "${value}" (chỉ nhận Full-time / Part-time)`);
}

function parseGender(value: string): 'MALE' | 'FEMALE' | 'OTHER' | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === 'nam') return 'MALE';
  if (normalized === 'nữ' || normalized === 'nu') return 'FEMALE';
  if (normalized === 'khác' || normalized === 'khac') return 'OTHER';
  throw new Error(`Giới tính không hợp lệ: "${value}" (chỉ nhận Nam / Nữ / Khác)`);
}

function parseStatus(value: string): 'WORKING' | 'TERMINATED' {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'WORKING';
  if (normalized === 'đang làm việc' || normalized === 'dang lam viec') return 'WORKING';
  if (normalized === 'đã nghỉ việc' || normalized === 'da nghi viec') return 'TERMINATED';
  throw new Error(`Trạng thái không hợp lệ: "${value}" (chỉ nhận Đang làm việc / Đã nghỉ việc)`);
}

function parseSalaryRate(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  if (Number.isNaN(n)) throw new Error(`Mức lương không hợp lệ: "${value}"`);
  return Math.round(n);
}

interface ImportRowResult {
  row: number;
  code: string;
  status: 'created' | 'updated' | 'error';
  message?: string;
}

export const employeesService = {
  list() {
    return prisma.employee.findMany({ include, orderBy: { createdAt: 'asc' } });
  },

  async exportAll() {
    const employees = await prisma.employee.findMany({ include, orderBy: { createdAt: 'asc' } });
    return buildExportWorkbook(employees);
  },

  async importRows(rows: ImportRow[]): Promise<ImportRowResult[]> {
    const [branches, departments, positions, levels] = await Promise.all([
      prisma.branch.findMany(),
      prisma.department.findMany(),
      prisma.position.findMany(),
      prisma.level.findMany(),
    ]);
    const findByName = <T extends { id: string; name: string }>(list: T[], name: string) =>
      list.find((x) => x.name.trim().toLowerCase() === name.trim().toLowerCase());

    const results: ImportRowResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // header is row 1
      try {
        if (!row.code) throw new Error('Thiếu mã nhân viên');
        if (!row.name) throw new Error('Thiếu họ tên');

        const branch = findByName(branches, row.branch);
        if (!branch) throw new Error(`Không tìm thấy chi nhánh "${row.branch}"`);
        const department = findByName(departments, row.department);
        if (!department) throw new Error(`Không tìm thấy bộ phận "${row.department}"`);
        const position = findByName(positions, row.position);
        if (!position) throw new Error(`Không tìm thấy chức vụ "${row.position}"`);
        const level = row.level ? findByName(levels, row.level) : undefined;
        if (row.level && !level) throw new Error(`Không tìm thấy level "${row.level}"`);

        const data = {
          name: row.name,
          phone: row.phone || undefined,
          branchId: branch.id,
          departmentId: department.id,
          positionId: position.id,
          levelId: level?.id,
          employeeType: parseEmployeeType(row.employeeType),
          salaryRate: parseSalaryRate(row.salaryRate),
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
          gender: parseGender(row.gender),
          permanentAddress: row.permanentAddress || undefined,
          currentAddress: row.currentAddress || undefined,
          bankName: row.bankName || undefined,
          bankAccountNumber: row.bankAccountNumber || undefined,
          idNumber: row.idNumber || undefined,
          idIssueDate: row.idIssueDate ? new Date(row.idIssueDate) : undefined,
          idIssuePlace: row.idIssuePlace || undefined,
          hireDate: row.hireDate ? new Date(row.hireDate) : undefined,
          status: parseStatus(row.status),
        };

        const existing = await prisma.employee.findUnique({ where: { code: row.code } });
        if (existing) {
          await prisma.employee.update({ where: { id: existing.id }, data });
          results.push({ row: rowNumber, code: row.code, status: 'updated' });
        } else {
          await prisma.employee.create({ data: { ...data, code: row.code } });
          results.push({ row: rowNumber, code: row.code, status: 'created' });
        }
      } catch (err) {
        results.push({
          row: rowNumber,
          code: row.code || '(trống)',
          status: 'error',
          message: err instanceof Error ? err.message : 'Lỗi không xác định',
        });
      }
    }

    return results;
  },

  async getById(id: string) {
    const employee = await prisma.employee.findUnique({ where: { id }, include });
    if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');
    return withImageUrls(employee);
  },

  async create(data: CreateEmployeeInput) {
    const passwordHash = data.email ? await bcrypt.hash(DEFAULT_PASSWORD, 10) : undefined;
    return prisma.employee.create({
      data: { ...withParsedDates(data), passwordHash },
      include,
    });
  },

  async update(id: string, data: UpdateEmployeeInput) {
    const existing = await this.getById(id);

    // Only assign the default password the first time an email is set — if
    // they already have a real passwordHash, leave it untouched so editing
    // the email later doesn't silently reset a password back to default.
    let passwordHash: string | undefined;
    if (data.email) {
      const withPassword = await prisma.employee.findUnique({
        where: { id },
        omit: { passwordHash: false },
      });
      if (!withPassword?.passwordHash) {
        passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: { ...withParsedDates(data), passwordHash },
      include,
    });

    // Best-effort cleanup: when a field is replaced with a new image key,
    // delete the old R2 object it pointed to so it doesn't linger unused.
    const replacedKeys = [
      data.idFrontImageKey && existing.idFrontImageKey !== data.idFrontImageKey
        ? existing.idFrontImageKey
        : null,
      data.idBackImageKey && existing.idBackImageKey !== data.idBackImageKey
        ? existing.idBackImageKey
        : null,
    ].filter((key): key is string => Boolean(key));
    await Promise.all(replacedKeys.map((key) => uploadsService.deleteFile(key).catch(() => {})));

    return withImageUrls(updated);
  },

  async changeType(id: string, employeeType: 'FULL_TIME' | 'PART_TIME', salaryRate?: number) {
    await this.getById(id);
    return prisma.employee.update({
      where: { id },
      data: { employeeType, salaryRate },
      include,
    });
  },

  async changePosition(id: string, positionId: string) {
    await this.getById(id);
    return prisma.employee.update({ where: { id }, data: { positionId }, include });
  },

  async changeBranch(id: string, branchId: string) {
    await this.getById(id);
    return prisma.employee.update({ where: { id }, data: { branchId }, include });
  },

  async terminate(id: string) {
    await this.getById(id);
    return prisma.employee.update({
      where: { id },
      data: { status: 'TERMINATED' },
      include,
    });
  },
};
