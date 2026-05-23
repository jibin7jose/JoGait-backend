# Step 1: Backend Setup & Architecture

This guide explains the step-by-step setup of the Node.js backend workspace for the JoGait application.

---

## 1. Project Initialization

To initialize the project, run the following commands in the `/backend` folder:
```bash
npm init -y
npm install express dotenv pg cors helmet jsonwebtoken bcryptjs
npm install --save-dev typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs nodemon ts-node
```

## 2. Directory Structure Setup

Create the following files and folders:
*   `src/server.ts`: Entry point.
*   `src/app.ts`: Express application config.
*   `src/config/`: Configuration files (db, environment variables).
*   `src/routes/`: Router directories.
*   `src/controllers/`: Route handlers.
*   `src/services/`: Core logic (e.g., calculations, external API calls).
*   `src/middlewares/`: Security & validation.

## 3. Server Initialization (`src/server.ts`)

```typescript
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server]: JoGait Backend running on port ${PORT}`);
});
```

## 4. Application Configuration (`src/app.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Status Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

export default app;
```
