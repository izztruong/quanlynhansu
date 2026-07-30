import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { requireAuth } from '@/common/auth-middleware';
import { authController } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
authRouter.post('/change-password', requireAuth, asyncHandler(authController.changePassword));
authRouter.get('/sessions', requireAuth, asyncHandler(authController.listSessions));
authRouter.delete('/sessions/:id', requireAuth, asyncHandler(authController.revokeSession));
