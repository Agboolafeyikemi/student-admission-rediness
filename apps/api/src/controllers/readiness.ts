import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { readinessService } from '../services/readiness.js';
import type { ProfileProgramQuery } from '../validators/query.js';
import type { ParsedQs } from 'qs';

export const getReadiness = asyncHandler<{}, {}, {}, ProfileProgramQuery & ParsedQs>(
  async (req, res: Response) => {
    const result = readinessService.get(req.query);
    res.json(result);
  },
);
