import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '@/common/async-handler';
import { requireAdmin } from '@/common/auth-middleware';
import { employeesController } from './employees.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const employeesRouter = Router();

// Excel routes go before /:id so "export"/"import-template" aren't matched as an id.
employeesRouter.get('/export', asyncHandler(employeesController.exportExcel));
employeesRouter.get('/import-template', asyncHandler(employeesController.importTemplate));
employeesRouter.post(
  '/import',
  requireAdmin,
  upload.single('file'),
  asyncHandler(employeesController.importExcel)
);

employeesRouter.get('/', asyncHandler(employeesController.list));
employeesRouter.get('/:id', asyncHandler(employeesController.getById));
employeesRouter.post('/', requireAdmin, asyncHandler(employeesController.create));
employeesRouter.put('/:id', requireAdmin, asyncHandler(employeesController.update));
employeesRouter.patch('/:id/type', requireAdmin, asyncHandler(employeesController.changeType));
employeesRouter.patch(
  '/:id/position',
  requireAdmin,
  asyncHandler(employeesController.changePosition)
);
employeesRouter.patch('/:id/branch', requireAdmin, asyncHandler(employeesController.changeBranch));
employeesRouter.patch(
  '/:id/terminate',
  requireAdmin,
  asyncHandler(employeesController.terminate)
);
