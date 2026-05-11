import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { programsRouter } from './routes/programs.js';
import { profilesRouter } from './routes/profiles.js';
import { checklistsRouter } from './routes/checklists.js';
import { readinessRouter } from './routes/readiness.js';
import { timelineRouter } from './routes/timeline.js';

export function createApp(): express.Express {
  const app = express();

  // ── Global middleware ───────────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  }); 

  // ── API routes ─────────────────────────────────────────────────────────────
  app.use('/programs', programsRouter);
  app.use('/profiles', profilesRouter);
  app.use('/checklists', checklistsRouter);
  app.use('/readiness', readinessRouter);
  app.use('/timeline', timelineRouter);

  // ── 404 — must come after all valid routes ─────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found', errors: [] });
  });

  // ── Global error handler — MUST be the last middleware registered ──────────
  // Express identifies error-handling middleware by its 4-argument signature.
  // Removing any parameter breaks this detection.
  app.use(errorHandler);

  return app;
}
