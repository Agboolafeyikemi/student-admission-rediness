import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { checklistService } from '../services/checklist.js';
import type { CreateChecklistInput, UpdateChecklistItemInput } from '../validators/checklist.js';

export const generateChecklist = asyncHandler<{}, {}, CreateChecklistInput>(
  async (req, res: Response) => {
    const items = checklistService.generate(req.body);
    res.status(201).json(items);
  },
);

export const updateChecklistItem = asyncHandler<{}, {}, UpdateChecklistItemInput>(
  async (req, res: Response) => {
    const item = checklistService.update(req.body);
    res.json(item);
  },
);
