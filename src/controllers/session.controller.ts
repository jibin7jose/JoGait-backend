import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const uploadSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.userId;
    const { id, planId, deviceId, startTime, endTime, scoreSummary, flags, metrics } = req.body;

    if (!id || !patientId || !deviceId || !startTime || !endTime || !metrics) {
      res.status(400).json({ error: 'Missing required session payload fields' });
      return;
    }

    // 1. Idempotency Check: Verify if session already exists
    const existingSession = await prisma.session.findUnique({
      where: { id }
    });

    if (existingSession) {
      // If it exists, return 200 OK without inserting to prevent double-writes on retry
      res.status(200).json({ message: 'Session already synced successfully', session: existingSession });
      return;
    }

    // 2. Transactional Insert: Insert Session and related Metrics atomically
    const newSession = await prisma.$transaction(async (prismaClient) => {
      // Create Session
      const session = await prismaClient.session.create({
        data: {
          id,
          patientId,
          planId,
          deviceId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          scoreSummary: scoreSummary || {},
          flags: flags || [],
        }
      });

      // Create Metrics bulk
      if (metrics && Array.isArray(metrics) && metrics.length > 0) {
        await prismaClient.metric.createMany({
          data: metrics.map((m: any) => ({
            sessionId: id,
            metricType: m.metricType,
            value: m.value,
            unit: m.unit,
            timestamp: new Date(m.timestamp),
          }))
        });
      }

      return session;
    });

    res.status(201).json({ message: 'Session uploaded successfully', session: newSession });
  } catch (error) {
    console.error('Session upload error:', error);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
};

export const addSessionNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'clinician' && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Only clinicians can add notes.' });
      return;
    }

    const { sessionId } = req.params;
    const { notes } = req.body;

    if (!notes) {
      res.status(400).json({ error: 'Notes content is required' });
      return;
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { notes }
    });

    res.status(200).json({ message: 'Note added successfully', session: updatedSession });
  } catch (error) {
    console.error('Add session note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
