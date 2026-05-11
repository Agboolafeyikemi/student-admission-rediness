import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { programService } from '../services/program.js';
import type { ProgramsQuery } from '../validators/query.js';

export const getPrograms = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, university, degreeType } = req.query as unknown as ProgramsQuery;
  const result = programService.list({ university, degreeType }, { page, limit });
  res.json(result);
});

export const getProgramById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const program = programService.getById(id);
  res.json(program);
});
