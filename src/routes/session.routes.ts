import { RequestHandler, Router } from 'express';
import { uploadSession, addSessionNote } from '../controllers/session.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect routes
router.use(authenticateToken);

// POST /api/sessions/upload
router.post('/upload', uploadSession as RequestHandler);

// POST /api/sessions/:sessionId/notes
router.post('/:sessionId/notes', addSessionNote as RequestHandler);

export default router;
