import { z } from 'zod';

// GET /programs
export const programsQuerySchema = z.object({
  page: z.coerce.number().int('page must be an integer').min(1, 'page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int('limit must be an integer')
    .min(1, 'limit must be at least 1')
    .max(50, 'limit cannot exceed 50')
    .default(10),
  university: z.string().optional(),
  degreeType: z.string().optional(),
});

// GET /programs/:id
export const programIdParamSchema = z.object({
  id: z.string().min(1, 'Program ID is required'),
});

// GET /readiness  GET /timeline
export const profileProgramQuerySchema = z.object({
  profileId: z.string().min(1, 'profileId is required'),
  programId: z.string().min(1, 'programId is required'),
});

export type ProgramsQuery = z.infer<typeof programsQuerySchema>;
export type ProfileProgramQuery = z.infer<typeof profileProgramQuerySchema>;
