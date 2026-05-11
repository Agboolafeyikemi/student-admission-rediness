import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createChecklistSchema, updateChecklistItemSchema } from '../validators/checklist.js';
import { generateChecklist, updateChecklistItem } from '../controllers/checklist.js';

const router = Router();

router.post('/', validate(createChecklistSchema, 'body'), generateChecklist);
router.patch('/item', validate(updateChecklistItemSchema, 'body'), updateChecklistItem);

export { router as checklistsRouter };
