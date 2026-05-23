# Database Layer

This folder will contain database services that wrap Prisma.

Recommended first files later:

- `prisma.service.ts`
- `prisma.module.ts`

Keep raw database access inside repositories or services. Controllers should not call Prisma directly.

