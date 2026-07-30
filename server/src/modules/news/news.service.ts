import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { CreateNewsInput, UpdateNewsInput } from './news.dto';

const include = { branch: true, department: true };

export const newsService = {
  list() {
    return prisma.news.findMany({ include, orderBy: { createdAt: 'desc' } });
  },

  async getById(id: string) {
    const news = await prisma.news.findUnique({ where: { id }, include });
    if (!news) throw new NotFoundError('Không tìm thấy tin tức');
    return news;
  },

  create(data: CreateNewsInput) {
    return prisma.news.create({ data, include });
  },

  async update(id: string, data: UpdateNewsInput) {
    await this.getById(id);
    return prisma.news.update({ where: { id }, data, include });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.news.delete({ where: { id } });
  },
};
