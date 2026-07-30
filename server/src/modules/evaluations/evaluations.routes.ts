import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { evaluationsController } from './evaluations.controller';

export const evaluationsRouter = Router();

evaluationsRouter.get('/', asyncHandler(evaluationsController.list));
evaluationsRouter.post('/', requireAdmin, asyncHandler(evaluationsController.create));
evaluationsRouter.get('/employee/:employeeId', asyncHandler(evaluationsController.listForEmployee));
evaluationsRouter.get(
  '/employee/:employeeId/latest',
  asyncHandler(evaluationsController.latestForEmployee)
);
evaluationsRouter.get('/:id', asyncHandler(evaluationsController.getById));
