import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { programsQuerySchema, programIdParamSchema } from '../validators/query.js';
import { getPrograms, getProgramById } from '../controllers/program.js';

const router = Router();

router.get('/', validate(programsQuerySchema, 'query'), getPrograms);
router.get('/:id', validate(programIdParamSchema, 'params'), getProgramById);

export { router as programsRouter };
