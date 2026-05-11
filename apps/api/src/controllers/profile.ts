import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { profileService } from '../services/profile.js';
import type { CreateProfileInput, UpdateProfileInput } from '../validators/profile.js';

export const getProfile = asyncHandler<{ id: string }>(async (req, res: Response) => {
  const profile = profileService.get(req.params.id);
  res.json(profile);
});

export const createProfile = asyncHandler<{}, {}, CreateProfileInput>(async (req, res: Response) => {
  const { profile, created } = profileService.create(req.body);
  res.status(created ? 201 : 200).json(profile);
});

export const updateProfile = asyncHandler<{ id: string }, {}, UpdateProfileInput>(
  async (req, res: Response) => {
    const profile = profileService.update(req.params.id, req.body);
    res.json(profile);
  },
);
