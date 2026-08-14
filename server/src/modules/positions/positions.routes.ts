import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { PERMISSION_RESOURCES, requirePermission } from '@/common/permissions';
import { positionsController } from './positions.controller';

export const positionsRouter = Router();

// Danh sách chức năng phân quyền được — đặt trước "/:id" để không bị bắt
// nhầm làm id. Ai đăng nhập cũng đọc được vì đây chỉ là danh mục tĩnh.
positionsRouter.get('/permission-resources', (_req, res) => {
  res.json({ data: PERMISSION_RESOURCES });
});

positionsRouter.get('/', asyncHandler(positionsController.list));
positionsRouter.get('/:id', asyncHandler(positionsController.getById));
positionsRouter.post('/', requirePermission('POSITIONS'), asyncHandler(positionsController.create));
positionsRouter.put('/:id', requirePermission('POSITIONS'), asyncHandler(positionsController.update));
positionsRouter.delete('/:id', requirePermission('POSITIONS'), asyncHandler(positionsController.remove));
