import type { Request, Response } from 'express';
import { employeesService } from './employees.service';
import { buildTemplateWorkbook, parseEmployeeWorkbook } from './employees.excel';
import { BadRequestError } from '@/common/errors';
import {
  assertBranchInScope,
  assertEmployeeInScope,
  employeeFilter,
  writableBranchId,
} from '@/common/data-scope';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  changeTypeSchema,
  changePositionSchema,
  changeBranchSchema,
} from './employees.dto';

export const employeesController = {
  async list(req: Request, res: Response) {
    const employees = await employeesService.list(await employeeFilter(req));
    res.json({ data: employees });
  },

  async exportExcel(req: Request, res: Response) {
    const workbook = await employeesService.exportAll(await employeeFilter(req));
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="nhan-vien.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  },

  async importTemplate(_req: Request, res: Response) {
    const workbook = buildTemplateWorkbook();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="mau-nhap-nhan-vien.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  },

  async importExcel(req: Request, res: Response) {
    if (!req.file) throw new BadRequestError('Thiếu file Excel cần tải lên');
    const rows = await parseEmployeeWorkbook(req.file.buffer);
    // Dòng ngoài phạm vi báo lỗi ở đúng dòng đó thay vì chặn cả file, để
    // người nhập sửa được phần sai mà không mất phần đúng.
    const results = await employeesService.importRows(rows, await writableBranchId(req));
    res.json({ data: results });
  },

  async getById(req: Request, res: Response) {
    await assertEmployeeInScope(req, req.params.id);
    const employee = await employeesService.getById(req.params.id);
    res.json({ data: employee });
  },

  async create(req: Request, res: Response) {
    const input = createEmployeeSchema.parse(req.body);
    await assertBranchInScope(req, input.branchId);
    const employee = await employeesService.create(input);
    res.status(201).json({ data: employee });
  },

  async update(req: Request, res: Response) {
    await assertEmployeeInScope(req, req.params.id);
    const input = updateEmployeeSchema.parse(req.body);
    if (input.branchId) await assertBranchInScope(req, input.branchId);
    const employee = await employeesService.update(req.params.id, input);
    res.json({ data: employee });
  },

  async changeType(req: Request, res: Response) {
    await assertEmployeeInScope(req, req.params.id);
    const { employeeType, salaryRate } = changeTypeSchema.parse(req.body);
    const employee = await employeesService.changeType(req.params.id, employeeType, salaryRate);
    res.json({ data: employee });
  },

  async changePosition(req: Request, res: Response) {
    await assertEmployeeInScope(req, req.params.id);
    const { positionId } = changePositionSchema.parse(req.body);
    const employee = await employeesService.changePosition(req.params.id, positionId);
    res.json({ data: employee });
  },

  async changeBranch(req: Request, res: Response) {
    // Chốt cả hai đầu: chỉ chốt nhân viên nguồn thì vẫn đẩy được người của
    // mình sang quán khác, chỉ chốt chi nhánh đích thì vẫn kéo được người
    // quán khác về mình.
    await assertEmployeeInScope(req, req.params.id);
    const { branchId } = changeBranchSchema.parse(req.body);
    await assertBranchInScope(req, branchId);
    const employee = await employeesService.changeBranch(req.params.id, branchId);
    res.json({ data: employee });
  },

  async terminate(req: Request, res: Response) {
    await assertEmployeeInScope(req, req.params.id);
    const employee = await employeesService.terminate(req.params.id);
    res.json({ data: employee });
  },
};
