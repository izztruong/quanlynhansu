import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { EmployeeScopeWhere } from '@/common/data-scope';
import type { CreateScheduleInput, ListSchedulesQuery } from './schedules.dto';

const include = {
  shift: true,
  employee: { include: { branch: true, department: true } },
};

export const schedulesService = {
  // Bộ lọc của người dùng và phạm vi để trong AND chứ không trộn chung một
  // object `employee`: trộn thì phạm vi ghi đè bộ lọc, lọc chi nhánh khác lại
  // ra dữ liệu quán mình, nhìn như hệ thống chạy sai.
  list(
    { from, to, branchId, departmentId, employeeId }: ListSchedulesQuery,
    scope: EmployeeScopeWhere = {}
  ) {
    return prisma.schedule.findMany({
      where: {
        AND: [
          {
            date: { gte: new Date(from), lte: new Date(to) },
            employeeId: employeeId || undefined,
            employee: {
              branchId: branchId || undefined,
              departmentId: departmentId || undefined,
            },
          },
          scope,
        ],
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

  async remove(id: string, scope: EmployeeScopeWhere = {}) {
    const { count } = await prisma.schedule.deleteMany({ where: { id, ...scope } });
    if (count === 0) throw new NotFoundError('Không tìm thấy lịch làm việc');
  },
};
