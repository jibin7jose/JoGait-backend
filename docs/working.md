# Backend Component Specification & Working Plan

This document details the operational plan, endpoints, and data lifecycle for the **JoGait Backend** service.

---

## 1. Technologies & Environment
*   **Runtime**: Node.js (LTS version)
*   **Framework**: Express.js (or Next.js API Routes if unified with dashboard)
*   **Database**: PostgreSQL
*   **ORM**: Prisma or Sequelize
*   **Hosting**: AWS Lambda (Serverless via Serverless Framework) or Docker container on AWS EC2

---

## 2. Directory Structure
```
/backend
  /src
    /controllers    # Endpoint handlers (Auth, Sync, Patients, Plans)
    /models         # Database models & schemas
    /routes         # Express router configurations
    /services       # Business logic (Sync helper, Auth verification)
    /utils          # Helper functions (logging, formatting)
    app.js          # Express app initialization
    server.js       # Entry point
```

---

## 3. Detailed Data Flow & Endpoints

### A. Patient Sync Flow
1.  Mobile app sends a `POST /api/sessions/upload` request with compressed JSON payloads containing session details.
2.  Backend authenticates the patient token and validates the payload shape (checks for required UUID, timestamps, and metric structure).
3.  Backend performs an **idempotent upsert** to prevent duplicate records if the upload is retried.
4.  Once stored, the backend computes or updates clinic-wide triage metadata (e.g., patient adherence, risk alerts).

### B. Clinician Prescription Flow
1.  Clinician builds a plan on the frontend dashboard and triggers `POST /api/plans/assign`.
2.  Backend stores the plan with an `active` status.
3.  When the patient's mobile app polls `GET /api/plans/my-plan`, the backend returns the active plan.
