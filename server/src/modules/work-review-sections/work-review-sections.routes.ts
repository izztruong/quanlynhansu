import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAnyPermission, requirePermission } from '@/common/permissions';
import { workReviewSectionsController } from './work-review-sections.controller';

export const workReviewSectionsRouter = Router();

// Form đánh giá tuần đổ mục nhận xét từ đây, nên ai làm được phiếu cũng đọc
// được danh mục này — không cần quyền vào trang cấu hình.
workReviewSectionsRouter.get(
  '/',
  requireAnyPermission('WORK_REVIEW_SECTIONS.VIEW', 'WORK_REVIEWS.VIEW'),
  asyncHandler(workReviewSectionsController.list)
);
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
