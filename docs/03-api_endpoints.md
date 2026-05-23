# Step 3: API Endpoints & Route Handlers

This guide outlines step-by-step route handler setups for authentication and session processing.

---

## 1. Authentication Controller (`src/controllers/auth.controller.ts`)

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // 1. Fetch user from DB
  // 2. Validate password: bcrypt.compare(password, user.password)
  // 3. Generate token: jwt.sign({ id: user.id }, process.env.JWT_SECRET)
  
  return res.status(200).json({ token: 'mock-jwt-token' });
};
```

## 2. Session Upload Handler (`src/controllers/session.controller.ts`)

```typescript
import { Request, Response } from 'express';

export const uploadSession = async (req: Request, res: Response) => {
  const { sessionId, patientId, startTime, endTime, scoreSummary, metrics, flags } = req.body;

  try {
    // 1. Check if sessionId already exists (for idempotency)
    // 2. Insert into postgres 'sessions' table
    // 3. Insert bulk records into 'session_metrics' table
    
    return res.status(201).json({
      status: 'success',
      sessionId,
      message: 'Session uploaded and saved'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process sync upload' });
  }
};
```

## 3. Router Mapping (`src/routes/session.routes.ts`)

```typescript
import { Router } from 'express';
import { uploadSession } from '../controllers/session.controller';

const router = Router();

router.post('/upload', uploadSession);

export default router;
```
