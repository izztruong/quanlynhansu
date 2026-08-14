import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { newsController } from './news.controller';

export const newsRouter = Router();

newsRouter.get('/', requirePermission('NEWS'), asyncHandler(newsController.list));
newsRouter.get('/:id', requirePermission('NEWS'), asyncHandler(newsController.getById));
newsRouter.post('/', requirePermission('NEWS'), asyncHandler(newsController.create));
newsRouter.put('/:id', requirePermission('NEWS'), asyncHandler(newsController.update));
newsRouter.delete('/:id', requirePermission('NEWS'), asyncHandler(newsController.remove));
