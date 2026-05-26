import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const assignPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'clinician' && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Only clinicians can assign plans.' });
      return;
    }

    const { patientId, title, description } = req.body;
    const clinicianId = req.user.userId;

    if (!patientId || !title) {
      res.status(400).json({ error: 'Missing required plan fields: patientId, title' });
      return;
    }

    const plan = await prisma.plan.create({
      data: {
        patientId,
        clinicianId,
        title,
        description,
        status: 'active'
      }
    });

    res.status(201).json({ message: 'Plan assigned successfully', plan });
  } catch (error) {
    console.error('Plan assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
