# REST API + Zod Implementation Index

Historical deep-dives for the REST + Zod work live under **[archive/](./archive/)**. Canonical, maintained references: **[ZOD_USAGE_EXAMPLES.md](./ZOD_USAGE_EXAMPLES.md)** and **[ZOD_VALIDATION_IMPLEMENTATION.md](./ZOD_VALIDATION_IMPLEMENTATION.md)** (repo root `docs/`).

## Documentation files

### Getting started (archive)

- **[REST_API_ZOD_GUIDE.md](./archive/rest-api-zod/REST_API_ZOD_GUIDE.md)** — architecture and approach
- **[ZOD_USAGE_EXAMPLES.md](./ZOD_USAGE_EXAMPLES.md)** — practical examples (maintained at docs root)

### Implementation details (archive)

- **[ZOD_IMPLEMENTATION_COMPLETE.md](./archive/ZOD_IMPLEMENTATION_COMPLETE.md)** — session snapshot
- **[ZOD_VALIDATION_IMPLEMENTATION.md](./ZOD_VALIDATION_IMPLEMENTATION.md)** — current summary of validated endpoints

### Reference (archive)

- **[REST_API_ZOD_IMPLEMENTATION_SUMMARY.md](./archive/rest-api-zod/REST_API_ZOD_IMPLEMENTATION_SUMMARY.md)**

### Session tracking (archive)

- **[SESSION2_COMPLETION_SUMMARY.md](./archive/SESSION2_COMPLETION_SUMMARY.md)**
- **[PRISMA_IMPLEMENTATION_TRACKING.md](./archive/prisma/PRISMA_IMPLEMENTATION_TRACKING.md)**

## Code files

### Schemas

- **[lib/validation-schemas.ts](../lib/validation-schemas.ts)** — shared Zod schemas for auth, uploads, milestones, notifications, and API bodies

### Query helpers

- **[lib/query-helpers.ts](../lib/query-helpers.ts)** — typed reads with Zod parsing (used where integrated, e.g. chat tools)

## Quick navigation

| Goal | Document |
|------|----------|
| Examples at docs root | [ZOD_USAGE_EXAMPLES.md](./ZOD_USAGE_EXAMPLES.md) |
| What is validated today | [ZOD_VALIDATION_IMPLEMENTATION.md](./ZOD_VALIDATION_IMPLEMENTATION.md) |
| Historical REST/Zod guide | [archive/rest-api-zod/REST_API_ZOD_GUIDE.md](./archive/rest-api-zod/REST_API_ZOD_GUIDE.md) |

## Implementation status

| Component | Status | Notes |
|-----------|--------|--------|
| Zod schemas | In use | `lib/validation-schemas.ts`; extend as new inputs are added |
| Query helpers | Available | `lib/query-helpers.ts`; adopt in services as needed |
| API routes | Partial | Same as below plus **POST `/api/chat`** (body) and **GET `/api/search`** (query). Many read-only portal/admin routes still use ad hoc checks. |
| Root docs | Maintained | This file + ZOD_* at docs root; long-form history in `archive/` |

## Key features

- Type-safe parsing where schemas are applied  
- Consistent validation error shape on those routes  
- Central schemas for shared shapes  

For operational security and Supabase setup, see [SECURITY_AND_SUPABASE_CONFIG.md](./SECURITY_AND_SUPABASE_CONFIG.md).
