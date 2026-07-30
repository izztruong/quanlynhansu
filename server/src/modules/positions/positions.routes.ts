import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { positionsController } from './positions.controller';

export const positionsRouter = Router();

positionsRouter.get('/', asyncHandler(positionsController.list));
positionsRouter.get('/:id', asyncHandler(positionsController.getById));
positionsRouter.post('/', requireAdmin, asyncHandler(positionsController.create));
positionsRouter.put('/:id', requireAdmin, asyncHandler(positionsController.update));
positionsRouter.delete('/:id', requireAdmin, asyncHandler(positionsController.remove));
