import { Router } from 'express';
import { getPatients, getPatientHistory } from '../controllers/patient.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect all patient routes with JWT authentication
router.use(authenticateToken);

// GET /api/patients - List all patients (clinicians only)
router.get('/', getPatients);

// GET /api/patients/:patientId/history - Get specific patient's sessions
router.get('/:patientId/history', getPatientHistory);

export default router;
