# Zod validation implementation

Central schemas live in **[lib/validation-schemas.ts](../lib/validation-schemas.ts)**. Index of long-form REST/Zod history: [REST_API_ZOD_INDEX.md](./REST_API_ZOD_INDEX.md).

## Shared error shape

Many routes return:

```json
{
  "error": "Validation failed",
  "details": {
    "fieldErrors": {},
    "formErrors": []
  }
}
```

(`details` is Zod’s `flatten()` output.)

## Schema groups in `validation-schemas.ts`

- Auth: signup, signin, forgot/reset password  
- Blog admin: create/update post  
- Uploads: images, contracts, deliverables  
- Milestones & notifications (admin)  
- Client assignments & rotation (admin)  
- Invoicing / Stripe payloads where used  
- **Chat:** `chatPostBodySchema` — messages array, optional `sessionId` UUID, last message must be user with non-empty `content`  
- **Search:** `searchQuerySchema` — `q` and/or `tag`, optional `type` (`blog` | `case-studies` | `all`)

## Route inventory (Zod `safeParse` / schema usage)

| Area | Routes (representative) |
|------|-------------------------|
| Auth | `POST` `/api/auth/signup`, `signin`, `forgot-password`, `reset-password`, `accept-invitation` |
| Chat | `POST` `/api/chat` |
| Search | `GET` `/api/search` |
| Images | `POST` `/api/images/upload` |
| Admin blog | `POST/PUT` `/api/admin/blog-posts`, `[slug]` |
| Admin milestones | `POST` `/api/admin/milestones`, `PUT` `[id]`, `POST` `[id]/updates` |
| Admin notifications | `POST` `/api/admin/notifications` |
| Admin uploads | `POST` `/api/admin/contracts/upload`, `deliverables/upload` |
| Admin invitations | `POST` `/api/admin/invitations/create`, list routes with body validation where applied |
| Admin clients | Mutations with body validation |
| Admin invoices | `POST` `/api/admin/invoices`, `POST` `/api/admin/invoices/remind` |
| Admin assignments | `POST` `/api/admin/assignments`, `PATCH` `[id]` |
| Admin rotation | `POST` `/api/admin/rotation`, `PATCH` `[id]`, `POST` `assign` |
| Stripe | `POST` `/api/stripe/create-payment-intent`, `create-subscription` |
| Portal subscriptions | `POST` `/api/portal/subscriptions/[id]/update`, `cancel` |
| Portal invoices | `GET` `/api/portal/invoices` (query) |
| Webhooks | `POST` `/api/webhooks/stripe` — signature + structured handling; `POST` `/api/webhooks/calcom` — verified payload via `lib/webhook-utils` (not necessarily Zod in the route file) |

Handlers not listed here may still validate IDs in code or rely on Supabase/RLS without a shared Zod schema.

## Usage example

```typescript
import { signUpSchema } from '@/lib/validation-schemas'

const validation = signUpSchema.safeParse(body)
if (!validation.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: validation.error.flatten() },
    { status: 400 }
  )
}
```

## Optional client-side forms

Use `@hookform/resolvers` + `zodResolver` with the same schemas where forms mirror API bodies.

## Historical note

Older notes about adopting Prisma lived in **docs/archive/**; this app uses Supabase clients and SQL migrations under `scripts/migrations/`.
