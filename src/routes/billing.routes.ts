import { Router } from 'express';
import { createSubscription } from '../controllers/billing.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect billing endpoints
router.use(authenticateToken);

// POST /api/billing/subscribe
router.post('/subscribe', createSubscription);

export default router;
