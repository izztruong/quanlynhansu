import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAnyPermission, requirePermission } from '@/common/permissions';
import { trainingCriteriaController } from './training-criteria.controller';

export const trainingCriteriaRouter = Router();

// Nhóm tiêu chí — "criteria/..." đứng trước "/:id" để không bị bắt nhầm làm id.
trainingCriteriaRouter.post(
  '/criteria',
  requirePermission('TRAINING_CRITERIA'),
  asyncHandler(trainingCriteriaController.createCriteria)
);
trainingCriteriaRouter.put(
  '/criteria/:id',
  requirePermission('TRAINING_CRITERIA'),
  asyncHandler(trainingCriteriaController.updateCriteria)
);
trainingCriteriaRouter.delete(
  '/criteria/:id',
  requirePermission('TRAINING_CRITERIA'),
  asyncHandler(trainingCriteriaController.removeCriteria)
);

// Form tạo nhật ký học việc phải đọc bộ tiêu chí để chấm điểm, nên ai làm
// được phiếu cũng đọc được danh mục này — không cần quyền vào trang cấu hình.
trainingCriteriaRouter.get(
  '/',
  requireAnyPermission('TRAINING_CRITERIA.VIEW', 'TRAINING_LOGS.VIEW'),
  asyncHandler(trainingCriteriaController.listGroups)
);
trainingCriteriaRouter.post('/', requirePermission('TRAINING_CRITERIA'), asyncHandler(trainingCriteriaController.createGroup));
trainingCriteriaRouter.put(
  '/:id',
  requirePermission('TRAINING_CRITERIA'),
  asyncHandler(trainingCriteriaController.updateGroup)
);
trainingCriteriaRouter.delete(
  '/:id',
  requirePermission('TRAINING_CRITERIA'),
  asyncHandler(trainingCriteriaController.removeGroup)
);
