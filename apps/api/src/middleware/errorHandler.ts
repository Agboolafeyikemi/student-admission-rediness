import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

// Universal error envelope — errors array is always present.
// Validation errors populate it; all other errors return an empty array.
type ErrorResponse = {
  message: string;
  errors: { field: string; message: string }[];
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Validation errors — field-level detail
  if (err instanceof ZodError) {
    const body: ErrorResponse = {
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      })),
    };
    res.status(400).json(body);
    return;
  }

  // Known operational errors — safe to surface message to client
  if (err instanceof AppError) {
    const body: ErrorResponse = { message: err.message, errors: [] };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown / programmer errors — log internally, never leak details
  console.error('[Unhandled error]', err);
  const body: ErrorResponse = { message: 'Internal Server Error', errors: [] };
  res.status(500).json(body);
};
