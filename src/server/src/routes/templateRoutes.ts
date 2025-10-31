import { Router } from 'express';
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../controllers/templateController';

const router = Router();

router.get('/', getAllTemplates);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
