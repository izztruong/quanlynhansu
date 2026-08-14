import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { levelsController } from './levels.controller';

export const levelsRouter = Router();

levelsRouter.get('/', asyncHandler(levelsController.list));
levelsRouter.get('/:id', asyncHandler(levelsController.getById));
levelsRouter.post('/', requirePermission('LEVELS'), asyncHandler(levelsController.create));
levelsRouter.put('/:id', requirePermission('LEVELS'), asyncHandler(levelsController.update));
levelsRouter.delete('/:id', requirePermission('LEVELS'), asyncHandler(levelsController.remove));
