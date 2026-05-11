import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { profileProgramQuerySchema } from '../validators/query.js';
import { getTimeline } from '../controllers/timeline.js';

const router = Router();

router.get('/', validate(profileProgramQuerySchema, 'query'), getTimeline);

export { router as timelineRouter };
