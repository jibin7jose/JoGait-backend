import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Basic Role-Based Access Control: only clinicians can view all patients
    if (req.user?.role !== 'clinician' && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Clinician role required.' });
      return;
    }

    const patients = await prisma.user.findMany({
      where: { role: 'patient' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    res.status(200).json({ patients });
  } catch (error) {
    console.error('Fetch patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    // Patients can only view their own history; clinicians can view anyone's.
    if (req.user?.role === 'patient' && req.user?.userId !== patientId) {
      res.status(403).json({ error: 'Access denied. Cannot view other patients.' });
      return;
    }

    const sessions = await prisma.session.findMany({
      where: { patientId },
      orderBy: { startTime: 'desc' },
    });

    const sessionIds = sessions.map((session) => session.id);
    const metrics = sessionIds.length
      ? await prisma.metric.findMany({
          where: { sessionId: { in: sessionIds } },
          orderBy: { timestamp: 'asc' },
        })
      : [];

    const metricsBySessionId = metrics.reduce<Record<string, typeof metrics>>((acc, metric) => {
      if (!acc[metric.sessionId]) {
        acc[metric.sessionId] = [];
      }

      acc[metric.sessionId].push(metric);
      return acc;
    }, {});

    res.status(200).json({
      sessions: sessions.map((session) => ({
        ...session,
        metrics: metricsBySessionId[session.id] || [],
      })),
    });
  } catch (error) {
    console.error('Fetch patient history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
