import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { profileProgramQuerySchema } from '../validators/query.js';
import { getReadiness } from '../controllers/readiness.js';

const router = Router();

router.get('/', validate(profileProgramQuerySchema, 'query'), getReadiness);

export { router as readinessRouter };
