import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { newsController } from './news.controller';

export const newsRouter = Router();

newsRouter.get('/', asyncHandler(newsController.list));
newsRouter.get('/:id', asyncHandler(newsController.getById));
newsRouter.post('/', requireAdmin, asyncHandler(newsController.create));
newsRouter.put('/:id', requireAdmin, asyncHandler(newsController.update));
newsRouter.delete('/:id', requireAdmin, asyncHandler(newsController.remove));
