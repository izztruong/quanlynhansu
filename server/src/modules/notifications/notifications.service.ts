import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type {
  CreateNotificationInput,
  UpdateNotificationInput,
} from './notifications.dto';

const include = {
  branches: { include: { branch: true } },
  departments: { include: { department: true } },
  specificEmployees: { include: { employee: true } },
};

export const notificationsService = {
  list() {
    return prisma.notification.findMany({ include, orderBy: { createdAt: 'desc' } });
  },

  async getById(id: string) {
    const notification = await prisma.notification.findUnique({ where: { id }, include });
    if (!notification) throw new NotFoundError('Không tìm thấy thông báo');
    return notification;
  },

  create({ branchIds, departmentIds, specificEmployeeIds, ...data }: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        ...data,
        branches: branchIds?.length
          ? { create: branchIds.map((branchId) => ({ branchId })) }
          : undefined,
        departments: departmentIds?.length
          ? { create: departmentIds.map((departmentId) => ({ departmentId })) }
          : undefined,
        specificEmployees: specificEmployeeIds?.length
          ? { create: specificEmployeeIds.map((employeeId) => ({ employeeId })) }
          : undefined,
      },
      include,
    });
  },

  async update(
    id: string,
    { branchIds, departmentIds, specificEmployeeIds, ...data }: UpdateNotificationInput
  ) {
    await this.getById(id);
    return prisma.notification.update({
      where: { id },
      data: {
        ...data,
        branches: branchIds
          ? { deleteMany: {}, create: branchIds.map((branchId) => ({ branchId })) }
          : undefined,
        departments: departmentIds
          ? { deleteMany: {}, create: departmentIds.map((departmentId) => ({ departmentId })) }
          : undefined,
        specificEmployees: specificEmployeeIds
          ? {
              deleteMany: {},
              create: specificEmployeeIds.map((employeeId) => ({ employeeId })),
            }
          : undefined,
      },
      include,
    });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.notification.delete({ where: { id } });
  },
};
