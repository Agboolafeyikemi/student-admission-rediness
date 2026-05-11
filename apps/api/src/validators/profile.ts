import { z } from 'zod';

const educationLevelSchema = z.enum(['bachelor', 'master', 'doctoral'], {
  errorMap: () => ({ message: "educationLevel must be 'bachelor', 'master', or 'doctoral'" }),
});

const targetTermSchema = z
  .string()
  .regex(/^(Fall|Spring|Summer) \d{4}$/, 'targetTerm must be in the format "Fall YYYY", "Spring YYYY", or "Summer YYYY"');

const testScoresSchema = z.object({
  gre: z.number().int().min(260, 'GRE score must be at least 260').max(340, 'GRE score cannot exceed 340').optional(),
  gmat: z.number().int().min(200, 'GMAT score must be at least 200').max(800, 'GMAT score cannot exceed 800').optional(),
  lsat: z.number().int().min(120, 'LSAT score must be at least 120').max(180, 'LSAT score cannot exceed 180').optional(),
  toefl: z.number().int().min(0, 'TOEFL score must be at least 0').max(120, 'TOEFL score cannot exceed 120').optional(),
  ielts: z.number().min(0, 'IELTS score must be at least 0').max(9, 'IELTS score cannot exceed 9.0').optional(),
});

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().trim().toLowerCase().email('Must be a valid email address'),
  gpa: z
    .number({ invalid_type_error: 'GPA must be a number' })
    .min(0, 'GPA must be at least 0')
    .max(4, 'GPA cannot exceed 4.0'),
  educationLevel: educationLevelSchema,
  targetTerm: targetTermSchema,
  testScores: testScoresSchema.optional(),
  selectedProgramIds: z.array(z.string().min(1)).default([]),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Name cannot be empty').max(100).optional(),
    email: z.string().trim().toLowerCase().email('Must be a valid email address').optional(),
    gpa: z.number().min(0, 'GPA must be at least 0').max(4, 'GPA cannot exceed 4.0').optional(),
    educationLevel: educationLevelSchema.optional(),
    targetTerm: targetTermSchema.optional(),
    testScores: testScoresSchema.optional(),
    selectedProgramIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const profileIdParamSchema = z.object({
  id: z.string().min(1, 'Profile ID is required'),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
