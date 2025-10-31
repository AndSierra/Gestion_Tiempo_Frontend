import { Router } from 'express';
import {
  getAllProjects,
  getProjectsByLeader,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController';

const router = Router();

router.get('/', getAllProjects);
router.get('/leader/:leaderId', getProjectsByLeader);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
