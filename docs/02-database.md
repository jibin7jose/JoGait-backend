# Step 2: Database Models & Migrations

This guide covers setting up the database connection and object-relational mapping (ORM) using Prisma.

---

## 1. Setup Prisma ORM

In the `/backend` folder, initialize Prisma:
```bash
npx prisma init
```
This creates the `prisma/schema.prisma` file and a `.env` file containing the connection string.

## 2. Schema Definition (`prisma/schema.prisma`)

Update the schema file:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  role      String   // "clinician" | "patient" | "admin"
  password  String
  createdAt DateTime @default(now())
}

model Session {
  id           String   @id
  patientId    String
  planId       String?
  deviceId     String
  startTime    DateTime
  endTime      DateTime
  scoreSummary Json     // { overallScore: number, symmetryIndex: number }
  flags        String[]
  createdAt    DateTime @default(now())
}

model Metric {
  id         String   @id @default(uuid())
  sessionId  String
  metricType String   // "kneeAngle" | "repCount"
  value      Float
  unit       String
  timestamp  DateTime
}
```

## 3. Applying Migrations

Run migrations to synchronize the database with the schema:
```bash
npx prisma migrate dev --name init
```
This generates SQL files and updates the database schema locally or in the cloud.
