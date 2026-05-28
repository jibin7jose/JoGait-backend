import { Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase();
}

function canManagePatients(req: AuthRequest) {
  return req.user?.role === 'clinician' || req.user?.role === 'admin';
}

export const createPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!canManagePatients(req)) {
      res.status(403).json({ error: 'Access denied. Clinician role required.' });
      return;
    }

    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!String(name || '').trim() || !EMAIL_PATTERN.test(email) || !String(password || '').trim()) {
      res.status(400).json({ error: 'Patient name, valid email, and temporary password are required' });
      return;
    }

    if (String(password).length < 8) {
      res.status(400).json({ error: 'Temporary password must be at least 8 characters' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email,
        password: hashedPassword,
        role: 'patient',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: 'Patient account created successfully', patient });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Basic Role-Based Access Control: only clinicians can view all patients
    if (!canManagePatients(req)) {
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
