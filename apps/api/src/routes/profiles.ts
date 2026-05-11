import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import {
  createProfileSchema,
  updateProfileSchema,
  profileIdParamSchema,
} from '../validators/profile.js';
import { getProfile, createProfile, updateProfile } from '../controllers/profile.js';

const router = Router();

router.post('/', validate(createProfileSchema, 'body'), createProfile);
router.get('/:id', validate(profileIdParamSchema, 'params'), getProfile);
router.patch('/:id', validate(profileIdParamSchema, 'params'), validate(updateProfileSchema, 'body'), updateProfile);

export { router as profilesRouter };
