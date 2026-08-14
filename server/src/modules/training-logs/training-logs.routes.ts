import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { trainingLogsController } from './training-logs.controller';

export const trainingLogsRouter = Router();

trainingLogsRouter.get('/', requirePermission('TRAINING_LOGS'), asyncHandler(trainingLogsController.list));
trainingLogsRouter.post('/', requirePermission('TRAINING_LOGS'), asyncHandler(trainingLogsController.create));
// "/:id/pdf" đứng trước "/:id" để không bị bắt nhầm.
trainingLogsRouter.get('/:id/pdf', requirePermission('TRAINING_LOGS'), asyncHandler(trainingLogsController.exportPdf));
trainingLogsRouter.get('/:id', requirePermission('TRAINING_LOGS'), asyncHandler(trainingLogsController.getById));
trainingLogsRouter.put('/:id', requirePermission('TRAINING_LOGS'), asyncHandler(trainingLogsController.update));
trainingLogsRouter.delete('/:id', requirePermission('TRAINING_LOGS'), asyncHandler(trainingLogsController.remove));
