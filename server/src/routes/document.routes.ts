import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  uploadDocument,
  listDocuments,
  getDocument,
  downloadDocument,
  deleteDocument,
} from '../controllers/document.controller.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);

export default router;
