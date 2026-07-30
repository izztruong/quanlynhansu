import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from '@/routes';
import { authRouter } from '@/modules/auth/auth.routes';
import { requireAuth } from '@/common/auth-middleware';
import { errorHandler } from '@/common/error-handler';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', requireAuth, apiRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`HRM API server đang chạy tại http://localhost:${port}`);
});
