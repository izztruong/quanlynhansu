import type { Request, Response } from 'express';
import { BadRequestError } from '@/common/errors';
import { uploadsService } from './uploads.service';

const ALLOWED_FOLDERS = ['id-cards', 'avatars', 'news', 'notifications', 'evaluations'] as const;

export const uploadsController = {
  async upload(req: Request, res: Response) {
    if (!req.file) {
      throw new BadRequestError('Thiếu file cần tải lên');
    }
    const folder = req.body.folder;
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestError('Thư mục lưu trữ không hợp lệ');
    }

    const { key } = await uploadsService.uploadFile(
      req.file.buffer,
      req.file.mimetype,
      folder,
      req.file.originalname
    );
    const url = await uploadsService.getSignedUrl(key);
    res.status(201).json({ data: { key, url } });
  },
};
