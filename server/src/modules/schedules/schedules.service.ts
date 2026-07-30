import { prisma } from '@/config/prisma';
import type { CreateScheduleInput, ListSchedulesQuery } from './schedules.dto';

const include = {
  shift: true,
  employee: { include: { branch: true, department: true } },
};

export const schedulesService = {
  list({ from, to, branchId, departmentId, employeeId }: ListSchedulesQuery) {
    return prisma.schedule.findMany({
      where: {
        date: { gte: new Date(from), lte: new Date(to) },
        employeeId: employeeId || undefined,
        employee: {
          branchId: branchId || undefined,
          departmentId: departmentId || undefined,
        },
      },
      include,
      orderBy: { date: 'asc' },
    });
  },

  create(data: CreateScheduleInput) {
    return prisma.schedule.create({
      data: { ...data, date: new Date(data.date) },
      include,
    });
  },

  remove(id: string) {
    return prisma.schedule.delete({ where: { id } });
  },
};
