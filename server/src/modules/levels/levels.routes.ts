import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { levelsController } from './levels.controller';

export const levelsRouter = Router();

levelsRouter.get('/', asyncHandler(levelsController.list));
levelsRouter.get('/:id', asyncHandler(levelsController.getById));
levelsRouter.post('/', requireAdmin, asyncHandler(levelsController.create));
levelsRouter.put('/:id', requireAdmin, asyncHandler(levelsController.update));
levelsRouter.delete('/:id', requireAdmin, asyncHandler(levelsController.remove));
