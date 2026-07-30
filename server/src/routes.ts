import { Router } from 'express';
import { branchesRouter } from '@/modules/branches/branches.routes';
import { departmentsRouter } from '@/modules/departments/departments.routes';
import { positionsRouter } from '@/modules/positions/positions.routes';
import { levelsRouter } from '@/modules/levels/levels.routes';
import { shiftsRouter } from '@/modules/shifts/shifts.routes';
import { employeesRouter } from '@/modules/employees/employees.routes';
import { schedulesRouter } from '@/modules/schedules/schedules.routes';
import { attendanceRouter } from '@/modules/attendance/attendance.routes';
import { newsRouter } from '@/modules/news/news.routes';
import { notificationsRouter } from '@/modules/notifications/notifications.routes';
import { uploadsRouter } from '@/modules/uploads/uploads.routes';
import { evaluationsRouter } from '@/modules/evaluations/evaluations.routes';

export const apiRouter = Router();

apiRouter.use('/branches', branchesRouter);
apiRouter.use('/departments', departmentsRouter);
apiRouter.use('/positions', positionsRouter);
apiRouter.use('/levels', levelsRouter);
apiRouter.use('/shifts', shiftsRouter);
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/schedules', schedulesRouter);
apiRouter.use('/attendance', attendanceRouter);
apiRouter.use('/news', newsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/uploads', uploadsRouter);
apiRouter.use('/evaluations', evaluationsRouter);
