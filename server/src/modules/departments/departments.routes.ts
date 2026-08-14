import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { departmentsController } from './departments.controller';

export const departmentsRouter = Router();

departmentsRouter.get('/', asyncHandler(departmentsController.list));
departmentsRouter.get('/:id', asyncHandler(departmentsController.getById));
departmentsRouter.post('/', requirePermission('DEPARTMENTS'), asyncHandler(departmentsController.create));
departmentsRouter.put('/:id', requirePermission('DEPARTMENTS'), asyncHandler(departmentsController.update));
departmentsRouter.delete('/:id', requirePermission('DEPARTMENTS'), asyncHandler(departmentsController.remove));
