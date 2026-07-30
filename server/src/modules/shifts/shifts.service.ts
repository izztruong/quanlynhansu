import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { CreateShiftInput, UpdateShiftInput } from './shifts.dto';

const include = {
  departments: { include: { department: true } },
};

export const shiftsService = {
  list() {
    return prisma.shift.findMany({ include, orderBy: { createdAt: 'asc' } });
  },

  async getById(id: string) {
    const shift = await prisma.shift.findUnique({ where: { id }, include });
    if (!shift) throw new NotFoundError('Không tìm thấy ca làm việc');
    return shift;
  },

  create({ departmentIds, ...data }: CreateShiftInput) {
    return prisma.shift.create({
      data: {
        ...data,
        departments: departmentIds?.length
          ? { create: departmentIds.map((departmentId) => ({ departmentId })) }
          : undefined,
      },
      include,
    });
  },

  async update(id: string, { departmentIds, ...data }: UpdateShiftInput) {
    await this.getById(id);
    return prisma.shift.update({
      where: { id },
      data: {
        ...data,
        departments: departmentIds
          ? {
              deleteMany: {},
              create: departmentIds.map((departmentId) => ({ departmentId })),
            }
          : undefined,
      },
      include,
    });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.shift.delete({ where: { id } });
  },
};
