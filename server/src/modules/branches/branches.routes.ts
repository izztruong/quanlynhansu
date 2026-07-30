import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { branchesController } from './branches.controller';

export const branchesRouter = Router();

branchesRouter.get('/', asyncHandler(branchesController.list));
branchesRouter.get('/:id', asyncHandler(branchesController.getById));
branchesRouter.post('/', requireAdmin, asyncHandler(branchesController.create));
branchesRouter.put('/:id', requireAdmin, asyncHandler(branchesController.update));
branchesRouter.delete('/:id', requireAdmin, asyncHandler(branchesController.remove));
