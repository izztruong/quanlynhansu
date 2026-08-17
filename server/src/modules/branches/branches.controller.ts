import type { Request, Response } from 'express';
import { assertBranchVisible, branchFilter } from '@/common/data-scope';
import { branchesService } from './branches.service';
import { createBranchSchema, updateBranchSchema } from './branches.dto';

export const branchesController = {
  async list(req: Request, res: Response) {
    const branches = await branchesService.list(await branchFilter(req));
    res.json({ data: branches });
  },

  async getById(req: Request, res: Response) {
    // Thu hẹp danh sách mà bỏ ngỏ đường đọc từng cái thì chỉ cần đoán id là
    // xem được — hai đường phải cùng một luật.
    await assertBranchVisible(req, req.params.id);
    const branch = await branchesService.getById(req.params.id);
    res.json({ data: branch });
  },

  async create(req: Request, res: Response) {
    const input = createBranchSchema.parse(req.body);
    const branch = await branchesService.create(input);
    res.status(201).json({ data: branch });
  },

  async update(req: Request, res: Response) {
    const input = updateBranchSchema.parse(req.body);
    const branch = await branchesService.update(req.params.id, input);
    res.json({ data: branch });
  },

  async remove(req: Request, res: Response) {
    await branchesService.remove(req.params.id);
    res.status(204).send();
  },
};
