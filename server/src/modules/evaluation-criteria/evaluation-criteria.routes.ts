import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { evaluationCriteriaController } from './evaluation-criteria.controller';

export const evaluationCriteriaRouter = Router();

evaluationCriteriaRouter.get('/', asyncHandler(evaluationCriteriaController.list));
evaluationCriteriaRouter.get('/:id', asyncHandler(evaluationCriteriaController.getById));
evaluationCriteriaRouter.post('/', requirePermission('EVALUATION_CRITERIA'), asyncHandler(evaluationCriteriaController.create));
evaluationCriteriaRouter.put('/:id', requirePermission('EVALUATION_CRITERIA'), asyncHandler(evaluationCriteriaController.update));
evaluationCriteriaRouter.delete(
  '/:id',
  requirePermission('EVALUATION_CRITERIA'),
  asyncHandler(evaluationCriteriaController.remove)
);
