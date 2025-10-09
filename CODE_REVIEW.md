# RepurposeAI Codebase Review

## 1. What the app does (plain language)
RepurposeAI is a Next.js web app that lets a creator write one piece of content and quickly reshape it for multiple social platforms. After signing in with Supabase authentication, a user can:

- Draft a master post, pick the tone, and ask the AI adapter to rewrite it for Twitter, LinkedIn, and Instagram (`app/create/page.tsx`).
- Save the results as drafts or schedule them for automatic posting via Upstash QStash jobs (`app/api/schedule/route.ts`, `lib/qstash.ts`).
- Browse a dashboard with quick stats, a calendar view of scheduled posts, and shortcuts to create or review items (`app/dashboard/page.tsx`).
- Manage drafts/scheduled items in bulk (delete, reschedule, duplicate) from the Posts area (`app/posts/page.tsx`, `app/api/posts/bulk/route.ts`).

Authentication, storage, and rate-limiting lean on Supabase and Upstash, while OpenAI provides the content adaptation engine (`lib/anthropic.ts`).

## 2. Architecture snapshot
- **Frontend**: Next.js App Router with client-heavy pages for dashboard, creation flow, and posts management. Shared layouts live in `components/layout`, and UI primitives come from `components/ui`.
- **Backend routes**: API endpoints under `app/api/**` handle content adaptation, scheduling, and bulk post operations.
- **Services**:
  - `lib/supabase.ts` exports the browser-ready Supabase client and a server-side admin factory.
  - `lib/supabase/server.ts` builds a cookie-aware Supabase client for edge/server routes.
  - `lib/anthropic.ts` wraps the OpenAI SDK for text adaptation.
  - `lib/qstash.ts` orchestrates delayed posting through Upstash QStash.
  - `lib/rate-limit.ts` centralises rate limiting via Upstash Redis.

## 3. Notable strengths
- **Thoughtful validation** in the AI adapter endpoint: content length limits, platform/tone whitelists, and sanitisation guardrails reduce prompt-injection risk (`app/api/adapt/route.ts`).
- **Structured error helpers** (`lib/api/errors.ts`) keep API responses consistent, which makes client-side handling easier.
- **Bulk tooling for posts** (duplicate/reschedule/delete) gives power users efficient workflows (`components/posts/BulkSelectToolbar.tsx`, `app/api/posts/bulk/route.ts`).

## 4. High-priority risks & fixes
1. **Server modules throw before the app boots when env vars are missing**  
   - `lib/supabase.ts`, `lib/qstash.ts`, and `lib/anthropic.ts` throw errors at import time if keys are absent. This crashes local dev, tests, or preview deployments that intentionally omit secrets.  
   ✅ *Suggested fix*: Replace top-level `throw` statements with helper functions that fail lazily (only when a feature is called) and provide fallback mocks for non-production environments. 【F:lib/supabase.ts†L3-L33】【F:lib/qstash.ts†L5-L69】【F:lib/anthropic.ts†L3-L169】

2. **Scheduling API trusts a `userId` coming from the browser**  
   - `/api/schedule` calls the admin Supabase client with whatever `userId` the client submits, so a malicious user could schedule posts for another account if they know the UUID. There is also no session check before touching QStash.  
   ✅ *Suggested fix*: Read the authenticated session inside the route (using `createClient` and `cookies`) and derive `userId` from the token instead of the request body. Only fall back to admin operations after verifying ownership. 【F:app/api/schedule/route.ts†L8-L157】

3. **Bulk post actions lack server-side auth**  
   - `/api/posts/bulk` uses the public Supabase client and trusts `userId` from the payload to scope queries. Without validating the current session, a forged request could act on another user’s posts.  
   ✅ *Suggested fix*: Initialise a server Supabase client tied to the request cookies, confirm the requester’s identity, and ignore/validate the incoming `userId`. Consider moving privileged operations to the service-role client after ownership checks. 【F:app/api/posts/bulk/route.ts†L1-L236】

4. **QStash scheduling hard-fails when `NEXT_PUBLIC_APP_URL` is unset**  
   - Local or test environments without this variable will crash instead of falling back to a sensible default.  
   ✅ *Suggested fix*: Provide a development default (e.g. `http://localhost:3000`) or surface a descriptive runtime error that doesn’t bring down the whole module. 【F:lib/qstash.ts†L5-L69】

## 5. Medium/low-priority improvements
- **Dashboard calendar only loads 10 posts**, so days later in the month may appear empty even if more exist. Consider querying by date range instead of a fixed limit. 【F:app/dashboard/page.tsx†L56-L133】
- **Repeated `checkUser` hooks** across pages could be extracted into a shared hook (e.g. `useRequireAuth`) to cut duplication and keep redirects consistent. 【F:app/create/page.tsx†L34-L55】【F:app/dashboard/page.tsx†L33-L54】
- **Naming mismatch**: `lib/anthropic.ts` actually wraps OpenAI. Renaming the file (or adding a comment) would reduce confusion when searching for providers. 【F:lib/anthropic.ts†L1-L169】
- **Clipboard usage lacks fallback** in `app/create/page.tsx`, which may throw in non-secure contexts. Wrap in a feature check and user feedback. 【F:app/create/page.tsx†L128-L195】

## 6. Suggested next steps
1. Harden all API routes by sourcing the signed-in user from Supabase sessions and enforcing row-level policies.
2. Refactor environment-sensitive libraries to degrade gracefully outside production.
3. Expand integration tests (e.g. Playwright or Jest) to cover scheduling and bulk actions once authentication is centralised.
4. Iterate on data fetching so dashboards stay accurate for heavy users (pagination or infinite scroll in addition to the calendar).

Overall, the project has a clear product focus and strong UI polish. Addressing the authentication and configuration edge cases will make it safer and easier to run in multiple environments.
