import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { workReviewSectionsController } from './work-review-sections.controller';

export const workReviewSectionsRouter = Router();

workReviewSectionsRouter.get('/', requirePermission('WORK_REVIEW_SECTIONS'), asyncHandler(workReviewSectionsController.list));
workReviewSectionsRouter.post('/', requirePermission('WORK_REVIEW_SECTIONS'), asyncHandler(workReviewSectionsController.create));
workReviewSectionsRouter.put(
  '/:id',
  requirePermission('WORK_REVIEW_SECTIONS'),
  asyncHandler(workReviewSectionsController.update)
);
workReviewSectionsRouter.delete(
  '/:id',
  requirePermission('WORK_REVIEW_SECTIONS'),
  asyncHandler(workReviewSectionsController.remove)
);
