import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    })
  );

  app.use(
    '/api',
    rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })
  );

  app.use('/api/auth', authRoutes);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use((req, res) => res.status(404).json({ message: 'Not found' }));
  return app;
}
