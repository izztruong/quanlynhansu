import type { Request, Response } from 'express';
import { notificationsService } from './notifications.service';
import { createNotificationSchema, updateNotificationSchema } from './notifications.dto';

export const notificationsController = {
  async list(_req: Request, res: Response) {
    const notifications = await notificationsService.list();
    res.json({ data: notifications });
  },

  async getById(req: Request, res: Response) {
    const notification = await notificationsService.getById(req.params.id);
    res.json({ data: notification });
  },

  async create(req: Request, res: Response) {
    const input = createNotificationSchema.parse(req.body);
    const notification = await notificationsService.create(input);
    res.status(201).json({ data: notification });
  },

  async update(req: Request, res: Response) {
    const input = updateNotificationSchema.parse(req.body);
    const notification = await notificationsService.update(req.params.id, input);
    res.json({ data: notification });
  },

  async remove(req: Request, res: Response) {
    await notificationsService.remove(req.params.id);
    res.status(204).send();
  },
};
