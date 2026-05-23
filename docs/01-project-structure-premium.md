# Premium Backend Structure

This is the recommended backend structure for JoGait.

```text
backend/
  docs/
    00-start-from-scratch.md
    01-project-structure-premium.md
    02-database.md
    03-api_endpoints.md
    04-sync_protocol.md
    05-working_plan.md
    tasks.md
    working.md

  prisma/
    schema.prisma
    seed.ts

  src/
    main.ts
    app.module.ts

    common/
      decorators/
      filters/
      guards/
      interceptors/
      pipes/

    config/

    database/

    modules/
      auth/
      users/
      patients/
      clinicians/
      exercise-plans/
      sessions/
      metrics/
      sync/
      notes/
      reports/

  test/
    app.e2e-spec.ts
    jest-e2e.json
```

## Folder Purpose

`docs/`: explains decisions, setup, database, APIs, and sync behavior.

`prisma/`: owns database schema, migrations, generated client, and seed data.

`src/common/`: reusable technical helpers used by many modules.

`src/config/`: typed environment and application configuration.

`src/database/`: Prisma module and database utilities.

`src/modules/`: feature modules. Each real business area gets its own module.

`test/`: e2e and integration tests.

## Module Internal Structure

As each module grows, use this pattern:

```text
patients/
  dto/
    create-patient.dto.ts
    update-patient.dto.ts
  patients.controller.ts
  patients.service.ts
  patients.module.ts
  patients.repository.ts
```

Use a repository only when database queries become complex. For very small modules, service plus Prisma is enough at the beginning.

