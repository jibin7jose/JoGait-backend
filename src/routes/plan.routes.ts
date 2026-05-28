import { RequestHandler, Router } from 'express';
import { assignPlan } from '../controllers/plan.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect plan routes
router.use(authenticateToken);

// POST /api/plans/assign - Clinician assigns plan to patient
router.post('/assign', assignPlan as RequestHandler);

export default router;
