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
import viewStatusRoutes from './routes/viewStatus.js'; // NEW

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Security & logging
  app.use(helmet());
  app.use(morgan('dev'));

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    })
  );

  // Basic rate limit on API
  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // Static serving for uploaded files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api', viewStatusRoutes); // NEW: exposes GET /api/admin/view-status

  // Health check
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // 404
  app.use((req, res) => res.status(404).json({ message: 'Not found' }));

  return app;
}
