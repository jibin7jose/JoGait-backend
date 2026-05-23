# Start Backend From Scratch

You are starting inside:

```powershell
PS D:\myproject\JoGait\backend>
```

## 1. What The Backend Does

The backend is the central server for JoGait.

It does not process camera video. The mobile app handles pose detection locally. The backend stores synchronized results so clinicians can review patient progress.

Main responsibilities:

- authenticate patients, clinicians, coordinators, and admins
- store patient profiles
- store clinician profiles
- receive session summaries from the mobile app
- store movement metrics
- let clinicians assign exercise plans
- let the dashboard read progress reports
- support offline-first mobile sync

## 2. First Commands

Run these from `backend`:

```powershell
npm install
copy .env.example .env
npm run start:dev
```

After the server starts:

- Health check: `http://localhost:4000/api/v1/health`
- API docs: `http://localhost:4000/api/docs`

## 3. Learning Order

Build in this order:

1. Health check
2. Prisma database connection
3. Users module
4. Auth module
5. Patients module
6. Clinicians module
7. Exercise plans module
8. Sessions upload module
9. Metrics module
10. Sync module
11. Notes module
12. Reports module

This order keeps the project understandable. Each step depends on the previous one.

## 4. Do Not Rush These

Before writing many APIs, understand these ideas:

- Controller: receives HTTP requests
- DTO: validates request body
- Service: contains business logic
- Module: groups related code
- Entity/model: database shape
- Guard: protects routes
- Pipe: validates and transforms data

