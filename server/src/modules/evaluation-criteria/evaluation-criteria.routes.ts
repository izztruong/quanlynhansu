import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { evaluationCriteriaController } from './evaluation-criteria.controller';

export const evaluationCriteriaRouter = Router();

evaluationCriteriaRouter.get('/', asyncHandler(evaluationCriteriaController.list));
evaluationCriteriaRouter.get('/:id', asyncHandler(evaluationCriteriaController.getById));
evaluationCriteriaRouter.post('/', requireAdmin, asyncHandler(evaluationCriteriaController.create));
evaluationCriteriaRouter.put('/:id', requireAdmin, asyncHandler(evaluationCriteriaController.update));
evaluationCriteriaRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(evaluationCriteriaController.remove)
);
