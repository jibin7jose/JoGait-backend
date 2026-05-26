import { Router } from 'express';
import { exportPatientFhir } from '../controllers/emr.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect EMR routes
router.use(authenticateToken);

// GET /api/emr/patient/:patientId/export - Generates HL7 FHIR bundle
router.get('/patient/:patientId/export', exportPatientFhir);

export default router;
