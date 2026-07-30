import { Router } from 'express';
import { asyncHandler } from '@/common/async-handler';
import { attendanceController } from './attendance.controller';

export const attendanceRouter = Router();

attendanceRouter.get('/', asyncHandler(attendanceController.list));
attendanceRouter.get('/me/today', asyncHandler(attendanceController.today));
attendanceRouter.post('/check-in', asyncHandler(attendanceController.checkIn));
attendanceRouter.post('/check-out', asyncHandler(attendanceController.checkOut));
