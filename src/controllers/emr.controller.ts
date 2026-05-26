import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { FhirService } from '../services/fhir.service';

export const exportPatientFhir = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    // EMR exports strictly limited to clinicians or admins
    if (req.user?.role !== 'clinician' && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. EMR export requires clinician role.' });
      return;
    }

    const patient = await prisma.user.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Fetch all sessions and associated metrics
    const sessions = await prisma.session.findMany({ where: { patientId } });
    const sessionIds = sessions.map(s => s.id);
    const metrics = await prisma.metric.findMany({ where: { sessionId: { in: sessionIds } } });

    // Process data through the HL7 FHIR mapping pipeline
    const fhirBundle = FhirService.convertToFhirBundle(patient, sessions, metrics);

    // Send the FHIR compliant JSON structure back
    res.status(200).json(fhirBundle);
  } catch (error) {
    console.error('FHIR export error:', error);
    res.status(500).json({ error: 'Internal server error during EMR export' });
  }
};
