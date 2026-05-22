import { Router } from 'express';
import { signup, login, refresh, logout, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authRateLimit } from '../middleware/rateLimit.middleware.js';
const router = Router();
router.post('/signup', authRateLimit, signup);
router.post('/login', authRateLimit, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
export default router;
//# sourceMappingURL=auth.routes.js.map