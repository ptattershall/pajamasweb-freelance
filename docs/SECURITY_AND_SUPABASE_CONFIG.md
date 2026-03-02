# Security & Supabase Configuration

## Supabase Auth URL configuration

For email confirmation and auth redirects to work correctly, configure these in the [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**:

| Setting                                      | Value  | Notes  |
|----------------------------------------------|--------|--------|
| **Site URL** | `https://yourdomain.com` (or `http://localhost:3000` in dev) | Must match your app origin. |
| **Redirect URLs** | Add each environment: | |
| | `https://yourdomain.com/auth/callback`     | Client callback page (handles hash or delegates to API).           |
| | `https://yourdomain.com/api/auth/callback` | Server-side callback (recommended for `token_hash` + `type` flow). |
| | `http://localhost:3000/auth/callback`      | Local dev.                                                         |
| | `http://localhost:3000/api/auth/callback`  | Local dev API callback.                                            |

Ensure `NEXT_PUBLIC_APP_URL` in `.env` matches the Site URL (e.g. `https://yourdomain.com` or `http://localhost:3000`).

### Email confirmation flow

1. **Server-side (recommended)**  
   User clicks the link in the email. If Supabase (or your template) sends them to your app with `token_hash` and `type` in the query string, the client callback page redirects to `GET /api/auth/callback?token_hash=...&type=...&next=/portal`. The API route:
   - Validates `token_hash` and `type` (e.g. `email`, `signup`, `email_change`).
   - Calls `supabase.auth.verifyOtp()`.
   - Updates `profiles.email_verified` for the user.
   - Redirects to `next` (validated to same origin) or `/portal`.

2. **Client-side (hash / session)**  
   If the user lands on `/auth/callback` with URL hash (`#access_token=...&refresh_token=...`) or an existing session, the page either calls `setSession()` then `POST /api/auth/confirm-email` with the Bearer token, or uses an existing session. The confirm-email route is rate-limited by IP and returns generic error messages.

---

## RLS (Row Level Security) verification

RLS policies are defined in `scripts/migrations/` (e.g. 002–012). To ensure they are active in your project:

1. **Apply migrations**  
   If you haven’t already, run the SQL in `scripts/migrations/` in order (e.g. in Supabase Dashboard → SQL Editor, or via your migration pipeline). Use the same order as the filenames (001, 002, 003, …).

2. **Verify in the dashboard**  
   - **Database** → **Tables** → select a table → **Policies**.  
   - Confirm RLS is **Enabled** and the expected policies exist (e.g. “Users can view own profile”, “Owner can view all profiles” for `profiles`).

3. **Tables that should have RLS**  
   - `profiles`, `bookings`, `invoices`, `contracts`, `deliverables`, `project_milestones`, `milestone_updates`, `invitations`, `milestone_notifications`, `subscriptions`, and storage buckets used for avatars/deliverables/contracts (see migrations 007, 010).

---

## Security checklist (implemented)

- **Security headers** in `next.config.ts`: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy.
- **Auth callback**: Server-side `GET /api/auth/callback` validates `token_hash`/`type`, uses `verifyOtp`, then updates `email_verified`; redirect target is same-origin only.
- **Confirm-email**: `POST /api/auth/confirm-email` requires Bearer JWT; rate-limited by IP (auth limiter); generic error responses (no user ids).
- **Chat**: Content moderation (PII, inappropriate content, spam, phishing) and prompt-injection checks before processing.
