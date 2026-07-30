import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '@/common/async-handler';
import { uploadsController } from './uploads.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadsRouter = Router();

uploadsRouter.post('/', upload.single('file'), asyncHandler(uploadsController.upload));
