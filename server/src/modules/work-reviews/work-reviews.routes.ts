import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { workReviewsController } from './work-reviews.controller';

export const workReviewsRouter = Router();

workReviewsRouter.get('/', requirePermission('WORK_REVIEWS'), asyncHandler(workReviewsController.list));
workReviewsRouter.post('/', requirePermission('WORK_REVIEWS'), asyncHandler(workReviewsController.create));
// "/employee/..." đứng trước "/:id" để không bị bắt nhầm làm id.
workReviewsRouter.get(
  '/employee/:employeeId/latest',
  requirePermission('WORK_REVIEWS'),
  asyncHandler(workReviewsController.latestForEmployee)
);
workReviewsRouter.get('/:id', requirePermission('WORK_REVIEWS'), asyncHandler(workReviewsController.getById));
workReviewsRouter.put('/:id', requirePermission('WORK_REVIEWS'), asyncHandler(workReviewsController.update));
workReviewsRouter.delete('/:id', requirePermission('WORK_REVIEWS'), asyncHandler(workReviewsController.remove));
