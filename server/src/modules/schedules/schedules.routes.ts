import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { schedulesController } from './schedules.controller';

export const schedulesRouter = Router();

schedulesRouter.get('/', requirePermission('SCHEDULES'), asyncHandler(schedulesController.list));
schedulesRouter.post('/', requirePermission('SCHEDULES'), asyncHandler(schedulesController.create));
schedulesRouter.delete('/:id', requirePermission('SCHEDULES'), asyncHandler(schedulesController.remove));
