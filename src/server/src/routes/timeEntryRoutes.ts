import { Router } from 'express';
import {
  getAllTimeEntries,
  getTimeEntriesByUser,
  getTimeEntriesByProject,
  getTimeEntriesByDateRange,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
} from '../controllers/timeEntryController';

const router = Router();

router.get('/', getAllTimeEntries);
router.get('/user/:userId', getTimeEntriesByUser);
router.get('/project/:projectId', getTimeEntriesByProject);
router.get('/date-range', getTimeEntriesByDateRange);
router.post('/', createTimeEntry);
router.put('/:id', updateTimeEntry);
router.delete('/:id', deleteTimeEntry);

export default router;
