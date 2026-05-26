import { Router } from 'express';
import { uploadSession } from '../controllers/session.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect the upload route with JWT authentication
router.post('/upload', authenticateToken, uploadSession);

export default router;
