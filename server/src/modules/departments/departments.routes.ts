import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { departmentsController } from './departments.controller';

export const departmentsRouter = Router();

departmentsRouter.get('/', asyncHandler(departmentsController.list));
departmentsRouter.get('/:id', asyncHandler(departmentsController.getById));
departmentsRouter.post('/', requireAdmin, asyncHandler(departmentsController.create));
departmentsRouter.put('/:id', requireAdmin, asyncHandler(departmentsController.update));
departmentsRouter.delete('/:id', requireAdmin, asyncHandler(departmentsController.remove));
