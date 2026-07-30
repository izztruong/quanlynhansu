import type { Request, Response } from 'express';
import { employeesService } from './employees.service';
import { buildTemplateWorkbook, parseEmployeeWorkbook } from './employees.excel';
import { BadRequestError } from '@/common/errors';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  changeTypeSchema,
  changePositionSchema,
  changeBranchSchema,
} from './employees.dto';

export const employeesController = {
  async list(_req: Request, res: Response) {
    const employees = await employeesService.list();
    res.json({ data: employees });
  },

  async exportExcel(_req: Request, res: Response) {
    const workbook = await employeesService.exportAll();
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
    const results = await employeesService.importRows(rows);
    res.json({ data: results });
  },

  async getById(req: Request, res: Response) {
    const employee = await employeesService.getById(req.params.id);
    res.json({ data: employee });
  },

  async create(req: Request, res: Response) {
    const input = createEmployeeSchema.parse(req.body);
    const employee = await employeesService.create(input);
    res.status(201).json({ data: employee });
  },

  async update(req: Request, res: Response) {
    const input = updateEmployeeSchema.parse(req.body);
    const employee = await employeesService.update(req.params.id, input);
    res.json({ data: employee });
  },

  async changeType(req: Request, res: Response) {
    const { employeeType, salaryRate } = changeTypeSchema.parse(req.body);
    const employee = await employeesService.changeType(req.params.id, employeeType, salaryRate);
    res.json({ data: employee });
  },

  async changePosition(req: Request, res: Response) {
    const { positionId } = changePositionSchema.parse(req.body);
    const employee = await employeesService.changePosition(req.params.id, positionId);
    res.json({ data: employee });
  },

  async changeBranch(req: Request, res: Response) {
    const { branchId } = changeBranchSchema.parse(req.body);
    const employee = await employeesService.changeBranch(req.params.id, branchId);
    res.json({ data: employee });
  },

  async terminate(req: Request, res: Response) {
    const employee = await employeesService.terminate(req.params.id);
    res.json({ data: employee });
  },
};
