import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { notificationsController } from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.get('/', requirePermission('NOTIFICATIONS'), asyncHandler(notificationsController.list));
notificationsRouter.get('/:id', requirePermission('NOTIFICATIONS'), asyncHandler(notificationsController.getById));
notificationsRouter.post('/', requirePermission('NOTIFICATIONS'), asyncHandler(notificationsController.create));
notificationsRouter.put('/:id', requirePermission('NOTIFICATIONS'), asyncHandler(notificationsController.update));
notificationsRouter.delete('/:id', requirePermission('NOTIFICATIONS'), asyncHandler(notificationsController.remove));
