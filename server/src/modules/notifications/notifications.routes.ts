import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { notificationsController } from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.get('/', asyncHandler(notificationsController.list));
notificationsRouter.get('/:id', asyncHandler(notificationsController.getById));
notificationsRouter.post('/', requireAdmin, asyncHandler(notificationsController.create));
notificationsRouter.put('/:id', requireAdmin, asyncHandler(notificationsController.update));
notificationsRouter.delete('/:id', requireAdmin, asyncHandler(notificationsController.remove));
