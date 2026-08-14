import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { evaluationsController } from './evaluations.controller';

export const evaluationsRouter = Router();

evaluationsRouter.get('/', requirePermission('EVALUATIONS'), asyncHandler(evaluationsController.list));
evaluationsRouter.post('/', requirePermission('EVALUATIONS'), asyncHandler(evaluationsController.create));
evaluationsRouter.get('/employee/:employeeId', requirePermission('EVALUATIONS'), asyncHandler(evaluationsController.listForEmployee));
evaluationsRouter.get(
  '/employee/:employeeId/latest',
  requirePermission('EVALUATIONS'), asyncHandler(evaluationsController.latestForEmployee)
);
evaluationsRouter.get('/:id', requirePermission('EVALUATIONS'), asyncHandler(evaluationsController.getById));
evaluationsRouter.delete('/:id', requirePermission('EVALUATIONS'), asyncHandler(evaluationsController.remove));
