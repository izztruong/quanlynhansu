import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { shiftsController } from './shifts.controller';

export const shiftsRouter = Router();

shiftsRouter.get('/', asyncHandler(shiftsController.list));
shiftsRouter.get('/:id', asyncHandler(shiftsController.getById));
shiftsRouter.post('/', requirePermission('SHIFTS'), asyncHandler(shiftsController.create));
shiftsRouter.put('/:id', requirePermission('SHIFTS'), asyncHandler(shiftsController.update));
shiftsRouter.delete('/:id', requirePermission('SHIFTS'), asyncHandler(shiftsController.remove));
