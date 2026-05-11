import type { Response } from 'express';
import type { ParsedQs } from 'qs';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { timelineService } from '../services/timeline.js';
import type { ProfileProgramQuery } from '../validators/query.js';

export const getTimeline = asyncHandler<{}, {}, {}, ProfileProgramQuery & ParsedQs>(
  async (req, res: Response) => {
    const events = timelineService.get(req.query);
    res.json(events);
  },
);
