import { RequestHandler, Router } from 'express';
import { createPatient, getPatients, getPatientHistory } from '../controllers/patient.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect all patient routes with JWT authentication
router.use(authenticateToken);

// GET /api/patients - List all patients (clinicians only)
router.get('/', getPatients as RequestHandler);

// POST /api/patients - Create a patient account (clinicians only)
router.post('/', createPatient as RequestHandler);

// GET /api/patients/:patientId/history - Get specific patient's sessions
router.get('/:patientId/history', getPatientHistory as RequestHandler);

export default router;
