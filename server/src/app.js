// server/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.js';
import viewStatusRoutes from './routes/viewStatus.js';
import docsRoutes from './routes/docs.js';
import avatarRoutes from './routes/avatar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
      exposedHeaders: ['Content-Disposition'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // allow DELETE for preflight [web:111][web:137]
    })
  );

  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/avatar', avatarRoutes);
  app.use('/api', viewStatusRoutes);
  app.use('/api/docs', docsRoutes);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use((req, res) => res.status(404).json({ message: 'Not found' }));
  return app;
}
