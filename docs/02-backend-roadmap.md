# Backend Roadmap

## Phase 1: Foundation

- Install dependencies
- Start NestJS server
- Confirm health endpoint
- Add Prisma service
- Connect PostgreSQL
- Run first migration

## Phase 2: Identity

- Create users table
- Add password hashing
- Add login endpoint
- Add JWT access token
- Add refresh token flow
- Add role-based guards

## Phase 3: Clinical Core

- Add patient profiles
- Add clinician profiles
- Add patient-clinician assignment rules
- Add exercise plan assignment

## Phase 4: Mobile Sync

- Add session upload endpoint
- Add idempotency using `mobileSessionId`
- Add metric batch insert
- Add last-sync fetch endpoint
- Add conflict handling rules

## Phase 5: Dashboard APIs

- Patient list with latest session status
- Patient detail page data
- Session detail with metrics
- Clinician notes
- Reports and exports

## Phase 6: Production Readiness

- Request logging
- Rate limiting
- Audit logs
- Error monitoring
- CI checks
- Deployment documentation

