import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { branchesController } from './branches.controller';

export const branchesRouter = Router();

branchesRouter.get('/', asyncHandler(branchesController.list));
branchesRouter.get('/:id', asyncHandler(branchesController.getById));
branchesRouter.post('/', requirePermission('BRANCHES'), asyncHandler(branchesController.create));
branchesRouter.put('/:id', requirePermission('BRANCHES'), asyncHandler(branchesController.update));
branchesRouter.delete('/:id', requirePermission('BRANCHES'), asyncHandler(branchesController.remove));
