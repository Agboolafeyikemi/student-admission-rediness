import { z } from 'zod';

export const createChecklistSchema = z.object({
  profileId: z.string().min(1, 'profileId is required'),
  programId: z.string().min(1, 'programId is required'),
});

export const updateChecklistItemSchema = z.object({
  profileId: z.string().min(1, 'profileId is required'),
  requirementId: z.string().min(1, 'requirementId is required'),
  status: z.enum(['not_started', 'in_progress', 'complete'], {
    errorMap: () => ({ message: "status must be 'not_started', 'in_progress', or 'complete'" }),
  }),
  notes: z.string().trim().max(1000, 'Notes must be 1000 characters or fewer').optional(),
});

export const checklistItemIdParamSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

export type CreateChecklistInput = z.infer<typeof createChecklistSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
