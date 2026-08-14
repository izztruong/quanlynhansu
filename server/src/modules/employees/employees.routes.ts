import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '@/common/async-handler';
import { requirePermission } from '@/common/permissions';
import { employeesController } from './employees.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const employeesRouter = Router();

// Excel routes go before /:id so "export"/"import-template" aren't matched as an id.
employeesRouter.get('/export', requirePermission('EMPLOYEES'), asyncHandler(employeesController.exportExcel));
employeesRouter.get(
  '/import-template',
  requirePermission('EMPLOYEES'),
  asyncHandler(employeesController.importTemplate)
);
employeesRouter.post(
  '/import',
  requirePermission('EMPLOYEES'),
  upload.single('file'),
  asyncHandler(employeesController.importExcel)
);

employeesRouter.get('/', requirePermission('EMPLOYEES'), asyncHandler(employeesController.list));
employeesRouter.get('/:id', requirePermission('EMPLOYEES'), asyncHandler(employeesController.getById));
employeesRouter.post('/', requirePermission('EMPLOYEES'), asyncHandler(employeesController.create));
employeesRouter.put('/:id', requirePermission('EMPLOYEES'), asyncHandler(employeesController.update));
employeesRouter.patch('/:id/type', requirePermission('EMPLOYEES'), asyncHandler(employeesController.changeType));
employeesRouter.patch(
  '/:id/position',
  requirePermission('EMPLOYEES'),
  asyncHandler(employeesController.changePosition)
);
employeesRouter.patch('/:id/branch', requirePermission('EMPLOYEES'), asyncHandler(employeesController.changeBranch));
employeesRouter.patch(
  '/:id/terminate',
  requirePermission('EMPLOYEES'),
  asyncHandler(employeesController.terminate)
);
