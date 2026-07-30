import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { shiftsController } from './shifts.controller';

export const shiftsRouter = Router();

shiftsRouter.get('/', asyncHandler(shiftsController.list));
shiftsRouter.get('/:id', asyncHandler(shiftsController.getById));
shiftsRouter.post('/', requireAdmin, asyncHandler(shiftsController.create));
shiftsRouter.put('/:id', requireAdmin, asyncHandler(shiftsController.update));
shiftsRouter.delete('/:id', requireAdmin, asyncHandler(shiftsController.remove));
