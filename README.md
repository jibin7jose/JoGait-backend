# JoGait Backend

Backend API for JoGait, a rehabilitation sync platform for mobile patients and clinician dashboards.

## Current Stage

This backend is starting from scratch. The first goal is to build a clean foundation before adding business logic:

- API server structure
- Database schema planning
- Authentication boundaries
- Offline sync endpoints
- Tests and documentation

## Recommended Stack

- Runtime: Node.js
- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT access tokens plus refresh tokens
- Testing: Jest and Supertest
- Validation: class-validator and class-transformer
- API docs: Swagger/OpenAPI

## Folder Map

```text
backend/
  docs/                 Project documentation
  prisma/               Database schema, migrations, seed scripts
  src/                  Application source code
  test/                 End-to-end and integration tests
  .env.example          Required environment variables
  package.json          Backend scripts and dependencies
```

Start with `docs/01-project-structure.md`, then continue through the numbered docs.
