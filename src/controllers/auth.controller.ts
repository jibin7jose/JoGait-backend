import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

const ALLOWED_ROLES = new Set(['clinician', 'patient']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET or JWT_ACCESS_SECRET must be set to at least 32 characters');
  }

  return secret;
}

function buildAuthResponse(user: { id: string; name: string; email: string; role: string }) {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn, issuer: 'jogait-api' },
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase();
}

async function canRegister(setupCode: unknown) {
  const existingUsers = await prisma.user.count();
  const requiredCode = process.env.AUTH_SETUP_CODE;

  if (requiredCode) {
    return String(setupCode || '') === requiredCode;
  }

  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return existingUsers === 0;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, password, role, setupCode } = req.body;
    const email = normalizeEmail(req.body.email);
    const nextRole = String(role || 'clinician');

    if (!(await canRegister(setupCode))) {
      res.status(403).json({ error: 'Registration is protected. Use the setup code or ask an admin to create your account.' });
      return;
    }

    if (!String(name || '').trim() || !EMAIL_PATTERN.test(email) || !String(password || '').trim()) {
      res.status(400).json({ error: 'Name, valid email, and password are required' });
      return;
    }

    if (String(password).length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    if (!ALLOWED_ROLES.has(nextRole)) {
      res.status(400).json({ error: 'Invalid account role' });
      return;
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email,
        password: hashedPassword,
        role: nextRole
      }
    });

    res.status(201).json({ message: 'User registered successfully', ...buildAuthResponse(user) });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!EMAIL_PATTERN.test(email) || !String(password || '').trim()) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    
    res.status(200).json({ message: 'Login successful', ...buildAuthResponse(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as Request & { user?: { userId: string } }).user;

    if (!authUser?.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Account no longer exists' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
