import ExcelJS from 'exceljs';
import { BadRequestError } from '@/common/errors';

// Structural type covering only the fields actually read here, rather than
// extending Prisma's generated Employee type — the app's global `omit:
// { passwordHash: true }` on the Prisma client makes query results not
// structurally match that generated type anyway.
interface EmployeeWithRelations {
  code: string;
  name: string;
  phone: string | null;
  employeeType: 'FULL_TIME' | 'PART_TIME';
  salaryRate: number | null;
  dateOfBirth: Date | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  idNumber: string | null;
  idIssueDate: Date | null;
  idIssuePlace: string | null;
  hireDate: Date | null;
  status: 'WORKING' | 'TERMINATED';
  branch: { name: string };
  department: { name: string };
  position: { name: string };
  level: { name: string } | null;
}

const GENDER_LABEL: Record<string, string> = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

export const COLUMNS = [
  { header: 'Mã nhân viên', key: 'code', width: 14, required: true },
  { header: 'Họ tên', key: 'name', width: 22, required: true },
  { header: 'Số điện thoại', key: 'phone', width: 14, required: false },
  { header: 'Chi nhánh', key: 'branch', width: 20, required: true },
  { header: 'Bộ phận', key: 'department', width: 16, required: true },
  { header: 'Chức vụ', key: 'position', width: 16, required: true },
  { header: 'Level', key: 'level', width: 12, required: false },
  { header: 'Loại nhân viên', key: 'employeeType', width: 14, required: false },
  { header: 'Mức lương', key: 'salaryRate', width: 12, required: false },
  { header: 'Ngày sinh', key: 'dateOfBirth', width: 12, required: false },
  { header: 'Giới tính', key: 'gender', width: 10, required: false },
  { header: 'Nơi thường trú', key: 'permanentAddress', width: 24, required: false },
  { header: 'Nơi ở hiện tại', key: 'currentAddress', width: 24, required: false },
  { header: 'Ngân hàng', key: 'bankName', width: 20, required: false },
  { header: 'Số tài khoản', key: 'bankAccountNumber', width: 18, required: false },
  { header: 'Số CCCD', key: 'idNumber', width: 16, required: false },
  { header: 'Ngày cấp CCCD', key: 'idIssueDate', width: 14, required: false },
  { header: 'Nơi cấp CCCD', key: 'idIssuePlace', width: 20, required: false },
  { header: 'Ngày vào làm', key: 'hireDate', width: 14, required: false },
  { header: 'Trạng thái', key: 'status', width: 16, required: false },
] as const;

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : '';
}

function employeeToRow(e: EmployeeWithRelations) {
  return {
    code: e.code,
    name: e.name,
    phone: e.phone ?? '',
    branch: e.branch.name,
    department: e.department.name,
    position: e.position.name,
    level: e.level?.name ?? '',
    employeeType: e.employeeType === 'FULL_TIME' ? 'Full-time' : 'Part-time',
    salaryRate: e.salaryRate ?? '',
    dateOfBirth: formatDate(e.dateOfBirth),
    gender: e.gender ? GENDER_LABEL[e.gender] : '',
    permanentAddress: e.permanentAddress ?? '',
    currentAddress: e.currentAddress ?? '',
    bankName: e.bankName ?? '',
    bankAccountNumber: e.bankAccountNumber ?? '',
    idNumber: e.idNumber ?? '',
    idIssueDate: formatDate(e.idIssueDate),
    idIssuePlace: e.idIssuePlace ?? '',
    hireDate: formatDate(e.hireDate),
    status: e.status === 'WORKING' ? 'Đang làm việc' : 'Đã nghỉ việc',
  };
}

function buildSheet(workbook: ExcelJS.Workbook, employees: EmployeeWithRelations[]) {
  const sheet = workbook.addWorksheet('Nhân viên');
  sheet.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  sheet.getRow(1).font = { bold: true };
  employees.forEach((e) => sheet.addRow(employeeToRow(e)));
  return sheet;
}

function addGuideSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet('Hướng dẫn');
  sheet.columns = [{ width: 90 }];
  const lines = [
    'Hướng dẫn nhập dữ liệu:',
    '- Cột có dấu * là bắt buộc: Mã nhân viên, Họ tên, Chi nhánh, Bộ phận, Chức vụ.',
    '- Nếu "Mã nhân viên" đã tồn tại trong hệ thống, dòng đó sẽ CẬP NHẬT nhân viên hiện có. Nếu chưa có, sẽ TẠO MỚI.',
    '- Chi nhánh / Bộ phận / Chức vụ / Level phải nhập đúng tên đang có trong hệ thống (xem ở Danh mục).',
    '- Loại nhân viên: chỉ nhận "Full-time" hoặc "Part-time" (để trống mặc định là Full-time).',
    '- Giới tính: chỉ nhận "Nam", "Nữ" hoặc "Khác".',
    '- Trạng thái: chỉ nhận "Đang làm việc" hoặc "Đã nghỉ việc" (để trống mặc định là Đang làm việc).',
    '- Các ngày (Ngày sinh, Ngày cấp CCCD, Ngày vào làm) nhập theo định dạng YYYY-MM-DD, ví dụ 2024-01-15.',
    '- Mức lương nhập số nguyên (VNĐ/giờ nếu Part-time, VNĐ/tháng nếu Full-time).',
  ];
  lines.forEach((line, i) => {
    const row = sheet.addRow([line]);
    if (i === 0) row.font = { bold: true };
  });
}

export function buildExportWorkbook(employees: EmployeeWithRelations[]) {
  const workbook = new ExcelJS.Workbook();
  buildSheet(workbook, employees);
  addGuideSheet(workbook);
  return workbook;
}

export function buildTemplateWorkbook() {
  const workbook = new ExcelJS.Workbook();
  const sheet = buildSheet(workbook, []);
  sheet.addRow({
    code: 'NV0100',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    branch: '(tên chi nhánh có sẵn)',
    department: '(tên bộ phận có sẵn)',
    position: '(tên chức vụ có sẵn)',
    level: '',
    employeeType: 'Full-time',
    salaryRate: 8000000,
    dateOfBirth: '2000-01-01',
    gender: 'Nam',
    status: 'Đang làm việc',
  });
  addGuideSheet(workbook);
  return workbook;
}

export type ImportRow = Record<(typeof COLUMNS)[number]['key'], string>;

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object' && 'text' in value) return String(value.text ?? '').trim();
  if (typeof value === 'object' && 'result' in value) return String(value.result ?? '').trim();
  return String(value).trim();
}

export async function parseEmployeeWorkbook(buffer: Buffer): Promise<ImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  try {
    // exceljs's bundled types expect a slightly different Buffer generic
    // than the Node globals resolve to here — the value is a real Buffer
    // at runtime, this is a structural typing mismatch only.
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  } catch {
    throw new BadRequestError('File không đúng định dạng Excel (.xlsx)');
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new BadRequestError('File Excel không có dữ liệu');

  const colIndexToKey = new Map<number, (typeof COLUMNS)[number]['key']>();
  sheet.getRow(1).eachCell((cell, colNumber) => {
    const text = String(cell.value ?? '').trim();
    const match = COLUMNS.find((c) => c.header === text);
    if (match) colIndexToKey.set(colNumber, match.key);
  });

  const foundKeys = new Set(colIndexToKey.values());
  const missing = COLUMNS.filter((c) => c.required && !foundKeys.has(c.key));
  if (missing.length) {
    throw new BadRequestError(
      `File thiếu cột bắt buộc: ${missing.map((m) => m.header).join(', ')}`
    );
  }

  const rows: ImportRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {} as ImportRow;
    let hasAnyValue = false;
    colIndexToKey.forEach((key, colNumber) => {
      const value = cellToString(row.getCell(colNumber).value);
      obj[key] = value;
      if (value) hasAnyValue = true;
    });
    if (hasAnyValue) rows.push(obj);
  });

  return rows;
}
