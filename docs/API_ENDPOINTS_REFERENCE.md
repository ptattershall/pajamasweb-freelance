# API endpoints reference

Summary of HTTP routes under `app/api/`. **Not exhaustive** — add new routes here when you ship them. Authentication patterns:

- **Portal:** Supabase session (e.g. `auth-token` cookie); see [lib/auth-service.ts](../lib/auth-service.ts), [proxy.ts](../proxy.ts).
- **Admin:** JWT in cookie + OWNER role checks on routes.
- **Webhooks / cron:** Shared secrets (`STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`, Cal.com secret, etc.).

For Zod-validated handlers, see [ZOD_VALIDATION_IMPLEMENTATION.md](./ZOD_VALIDATION_IMPLEMENTATION.md) and [REST_API_ZOD_INDEX.md](./REST_API_ZOD_INDEX.md).

## Portal (`/api/portal/*`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/portal/profile` | Current user profile / role |
| PATCH | `/api/portal/profile` | Update profile |
| POST | `/api/portal/avatar` | Avatar upload |
| GET | `/api/portal/dashboard` | Dashboard aggregates |
| GET | `/api/portal/projects/overview` | Project stats + lists |
| GET | `/api/portal/milestones`, `GET /api/portal/milestones/[id]` | Milestones |
| GET | `/api/portal/invoices`, `GET /api/portal/invoices/[id]` | Invoices (list uses query validation where applied) |
| GET | `/api/portal/payments`, `GET /api/portal/payments/[id]` | Payments |
| GET | `/api/portal/subscriptions`, `GET /api/portal/subscriptions/[id]` | Subscriptions |
| POST | `/api/portal/subscriptions/[id]/update` | Change plan |
| POST | `/api/portal/subscriptions/[id]/cancel` | Cancel subscription |
| GET | `/api/portal/subscriptions/[id]/prices` | Available prices |
| GET | `/api/portal/bookings` | Bookings (CLIENT vs SALES/DEV filtering) |
| GET/PATCH/DELETE | `/api/portal/bookings/[id]` | Booking detail / updates |
| POST | `/api/portal/bookings/[id]/cancel` | Cancel booking |
| GET | `/api/portal/bookings/[id]/ics` | ICS download |
| GET | `/api/portal/contracts`, `GET /api/portal/contracts/[id]/download` | Contracts |
| GET | `/api/portal/deliverables`, `GET /api/portal/deliverables/[id]/download` | Deliverables |
| GET | `/api/portal/notifications`, `POST /api/portal/notifications/[id]/read` | Notifications |
| GET | `/api/portal/chat-history`, `GET /api/portal/chat-history/[id]`, related/export | Chat history |
| GET | `/api/portal/chat-analytics` | Chat analytics |
| GET | `/api/portal/assigned-clients` | SALES/DEV assigned clients |

## Admin (`/api/admin/*`)

| Method | Path | Purpose |
|--------|------|---------|
| CRUD | `/api/admin/clients`, `/api/admin/clients/[id]` | Clients |
| * | `/api/admin/invitations`, `create`, `[id]/resend`, `[id]/revoke` | Invitations |
| * | `/api/admin/milestones`, `[id]`, `[id]/updates` | Milestones & updates |
| POST | `/api/admin/notifications` | Create notification |
| * | `/api/admin/invoices`, `POST .../remind` | Invoices & reminders |
| GET | `/api/admin/payments`, `/metrics`, `/export` | Payments reporting |
| GET | `/api/admin/subscriptions` | Subscriptions overview |
| POST | `/api/admin/contracts/upload`, `/api/admin/deliverables/upload` | File uploads |
| * | `/api/admin/blog-posts`, `[slug]` | Blog MDX sync / admin |
| * | `/api/admin/assignments`, `/api/admin/assignments/[id]` | Client assignments |
| * | `/api/admin/rotation`, `/api/admin/rotation/[id]`, `POST .../assign` | Rotation |

## Auth & public API

| Method | Path | Purpose |
|--------|------|---------|
| * | `/api/auth/signup`, `signin`, `signout`, `forgot-password`, `reset-password` | Auth |
| * | `/api/auth/callback`, `confirm-email`, `token` | Email verify / session |
| * | `/api/auth/validate-invitation`, `accept-invitation` | Invitations |
| POST | `/api/chat` | Streaming AI chat (Bearer token) |
| GET | `/api/search` | Blog/case study search |
| GET | `/api/services/[slug]` | Service JSON |
| GET | `/api/related-posts`, `/api/related-case-studies` | Recommendations |
| POST | `/api/stripe/create-payment-intent`, `create-subscription` | Checkout prep |
| GET | `/api/stripe/retrieve-payment-intent` | Payment status |
| POST | `/api/images/upload`, `/api/images/delete` | Image uploads |
| GET | `/api/sitemap`, `/api/robots` | SEO |
| GET | `/api/og/...` | OG images |

## Webhooks & cron

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/webhooks/stripe` | Stripe events |
| POST | `/api/webhooks/calcom` | Cal.com bookings |
| GET | `/api/cron/send-invoice-reminders` | Scheduled reminders (`CRON_SECRET`) |

## Legacy detail: milestones & notifications

The following request/response shapes still apply to milestone/notification handlers (Zod on mutating admin routes where implemented):

### Milestone (portal)

`GET /api/portal/milestones` → `Milestone[]`

`GET /api/portal/milestones/[id]` → milestone + `updates: MilestoneUpdate[]`

### Milestone (admin)

- `POST /api/admin/milestones` — body: `client_id`, `title`, optional `description`, `due_date`, `status`, `progress_percent`
- `PUT /api/admin/milestones/[id]` — partial updates
- `DELETE /api/admin/milestones/[id]`
- `POST /api/admin/milestones/[id]/updates` — `update_text`

### Notification (admin)

`POST /api/admin/notifications` — `client_id`, `milestone_id`, `notification_type`, `message`

### Types (sketch)

```typescript
type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
```

## Errors

Typical JSON: `{ "error": string }` with status **401** / **403** / **404** / **422** (validation) / **500**.

## Rate limiting

Applied on selected routes (e.g. chat, auth confirm-email). Not uniform across all `app/api/*` handlers.

---

**Last updated:** April 2026
