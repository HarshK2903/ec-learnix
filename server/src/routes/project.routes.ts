import { Router } from 'express';
import { authMiddleware as authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  createProject,
  listProjects,
  listTrash,
  getProject,
  updateProject,
  deleteProject,
  restoreProject,
  permanentDeleteProject,
  importProject,
  exportProject,
} from '../controllers/project.controller.js';

const router = Router();

router.use(authenticate);

// Static/specific routes FIRST
router.post('/', createProject);
router.get('/', listProjects);
router.get('/trash', listTrash);
router.post('/import', upload.single('file'), importProject);

// Param sub-routes BEFORE the bare /:id
router.get('/:id/export', exportProject);
router.post('/:id/restore', restoreProject);
router.delete('/:id/permanent', permanentDeleteProject);

// Bare param routes LAST
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
