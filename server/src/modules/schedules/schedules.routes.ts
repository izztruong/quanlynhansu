import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { schedulesController } from './schedules.controller';

export const schedulesRouter = Router();

schedulesRouter.get('/', asyncHandler(schedulesController.list));
schedulesRouter.post('/', requireAdmin, asyncHandler(schedulesController.create));
schedulesRouter.delete('/:id', requireAdmin, asyncHandler(schedulesController.remove));
