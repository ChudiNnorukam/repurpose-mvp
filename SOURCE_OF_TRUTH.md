# Repurpose MVP — Source of Truth

**Version**: 0.1.0
**Last Updated**: October 9, 2025
**Purpose**: Definitive reference for team, security, architecture, operations, scope.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Vision & Scope](#2-vision--scope-mvp-boundaries)
3. [Architecture & Tech Stack](#3-architecture--tech-stack)
4. [Data Model / Schema](#4-data-model)
5. [API Endpoints](#5-api-endpoints-mvp)
6. [Frontend Behavior / Pages](#6-frontend-pages--behavior)
7. [Auth & Security](#7-auth--security)
8. [Integrations](#8-integrations--edge-cases)
9. [Operational Concerns](#9-operational-concerns)
10. [Testing & QA](#10-testing--qa-strategy)
11. [Deployment, Environments & Secrets](#11-deployment-environments--secrets)
12. [Known Risks & Tradeoffs](#12-known-risks--tradeoffs)
13. [Roadmap & Milestones](#13-roadmap--milestones-post-mvp)
14. [Appendices / Diagrams](#14-appendices--diagrams)

---

## 1. Overview

**What is Repurpose?**
An MVP web app that lets users adapt a piece of content (text, perhaps with images) into platform-appropriate versions (LinkedIn, Twitter, etc.), schedule them for posting, and manage their social accounts.

**Primary Users / Personas**

* Individual creators
* Small teams / solopreneurs
* Marketing managers with 1–5 accounts

**Key Value**

* Reduce friction in turning content into multi-platform posts
* Allow scheduling + automation
* Central dashboard for post management

**Out of Scope (for MVP)**

* Full media (video) adaptation
* Rich post templates (stories, carousels)
* Team collaboration / roles
* Analytics/dashboard beyond "posted / failed"

---

## 2. Vision & Scope (MVP Boundaries)

* Must support Twitter and LinkedIn posting
* Allow user to connect accounts, enter content, adapt for platforms
* Schedule posts (future)
* Show statuses: draft, scheduled, posted, failed
* Minimal UI plumbing (dashboard, post list, content editor)
* Basic error display, retry manual

---

## 3. Architecture & Tech Stack

**Frontend**

* Next.js 15 + App Router
* TypeScript
* Tailwind CSS + class-variance-authority
* Framer Motion (light animations)
* shadcn/ui components

**Backend / APIs**

* Next.js API Routes (app/api)
* Supabase (PostgreSQL + Auth)
* QStash (for delayed jobs)
* OpenAI (via `lib/openai.ts`)

**Hosting / Runtime**

* Vercel for deployment
* Serverless functions for API / jobs

**Third-Party Services**

* Twitter API v2
* LinkedIn API
* Upstash (QStash)
* Sentry / logging (planned)

---

## 4. Data Model

### Tables & Fields

**social_accounts**

* `id: uuid (PK)`
* `user_id: uuid` (FK → auth.users)
* `platform: text` (enum: 'twitter', 'linkedin')
* `access_token: text`
* `refresh_token: text | null`
* `expires_at: timestamptz | null`
* `account_username: text`
* `connected_at: timestamptz` (default: now())
* `created_at: timestamptz` (default: now())

**posts**

* `id: uuid (PK)`
* `user_id: uuid` (FK → auth.users)
* `platform: text` (enum: 'twitter', 'linkedin')
* `original_content: text`
* `content: text` (adapted content)
* `scheduled_time: timestamptz | null`
* `status: text` (enum: 'draft', 'scheduled', 'posted', 'failed')
* `posted_at: timestamptz | null`
* `error_message: text | null`
* `qstash_message_id: text | null`
* `created_at: timestamptz` (default: now())
* `updated_at: timestamptz` (default: now())

**RLS Policies**

* Both tables have RLS enabled
* Users can only SELECT/INSERT/UPDATE/DELETE their own records
* Policy: `auth.uid() = user_id`

---

## 5. API Endpoints (MVP)

| Method | Path | Purpose | Auth? | Notes |
|--------|------|---------|-------|-------|
| POST | `/api/adapt` | Accept original content + target platforms → return adapted outputs | ✅ | Validate input, throttle, call OpenAI |
| POST | `/api/schedule` | Schedule a post | ✅ | Insert post row + schedule QStash job |
| POST | `/api/post/execute` | QStash callback to publish post | ✅ + QStash signature verify | Update status, handle errors |
| POST | `/api/post/retry` | Manual retry of failed post | ✅ | Re-invoke execution |
| GET | `/api/posts` | Get user's posts | ✅ | Returns all posts for current user |
| GET/POST | `/api/auth/twitter` & callback | Initiate and handle Twitter OAuth | ✅ (for callback) | Use PKCE |
| GET/POST | `/api/auth/linkedin` & callback | LinkedIn OAuth flows | ✅ | Standard OAuth |
| GET | `/api/auth/accounts` | Get connected social accounts | ✅ | Returns user's connected accounts |
| POST | `/api/templates/generate` | Return templated content | ✅ | AI-generated templates |

---

## 6. Frontend Pages & Behavior

| Page | Purpose / Flow | Data Load / API Calls |
|------|----------------|---------------------|
| Landing Page (`/landing`) | Marketing / signup / login | Public |
| Login (`/login`) | Auth flows via Supabase | Uses `supabase.auth` |
| Dashboard (`/dashboard`) | Show upcoming / past posts | GET `/api/posts` |
| Create / Adapt Page (`/create`) | Enter content, choose platforms & tone | POST `/api/adapt`, show previews |
| Schedule Page / Widget | Pick datetime, schedule | POST `/api/schedule` |
| Posts / History (`/posts`) | Show list with status, retry button | GET `/api/posts`, retry calls |
| Connections / Accounts (`/connections`) | Show connected social accounts, add / remove | OAuth flows, GET `/api/auth/accounts` |
| Templates Page (`/templates`) | Prebuilt prompt templates | GET/POST `/api/templates/generate` |

**Client-side Auth Guard**

* If user not logged in, redirect to `/login`
* Use server session where needed
* Middleware protects authenticated routes

---

## 7. Auth & Security

* **Supabase Auth** for email/password authentication
* **RLS (Row Level Security)** policies on `posts` & `social_accounts` so users can only see/modify their own records
* **API Protection**: Middleware checking JWT or session
* **QStash Callbacks**: Must verify signature using `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY`
* **Input Sanitization**: Length limits (max content length)
* **Rate Limiting**: On `/api/adapt` and other endpoints
* **PKCE for Twitter OAuth**: Verifier stored securely, not hardcoded
* **Secret Management**: Rotate and secure secrets; never commit `.env` files

**Security Checklist**

- [ ] All API routes validate authentication
- [ ] RLS policies tested and verified
- [ ] QStash signature verification in place
- [ ] Input validation on all user inputs
- [ ] Rate limiting configured
- [ ] Secrets rotation schedule defined
- [ ] OAuth tokens encrypted at rest

---

## 8. Integrations & Edge Cases

**OpenAI**

* Adaptation prompt versioning (see `lib/openai.ts`)
* Fallback strategies for API failures
* Cost monitoring and rate limiting

**Twitter API v2**

* Token refresh logic (OAuth 2.0 with PKCE)
* Error codes: rate limits (429), unauthorized (401), forbidden (403)
* Character limits: 280 chars
* Thread support (future)

**LinkedIn API**

* Token refresh (expires after 60 days)
* Post types: text posts, articles, images (future)
* Character limits: 3000 chars
* Error handling for expired tokens

**QStash**

* Scheduling delays and retries
* Signature validation (current + next signing keys)
* Failed job handling
* Deduplication via message IDs

**Timezone Handling**

* Store everything as UTC in DB
* Convert to user timezone in UI
* Use `date-fns` or `dayjs` for conversions

**Error / Retry Logic**

* Transient API errors: automatic retry (exponential backoff)
* Persistent errors: show to user with actionable message
* Manual retry button for failed posts

---

## 9. Operational Concerns

**Logging & Monitoring**

* Sentry for error tracking (planned)
* Vercel Analytics for performance
* Custom logging for:
  - API failures
  - QStash job failures
  - OAuth errors
  - OpenAI usage

**Metrics to Track**

* Post success/failure rates
* API latency (p50, p95, p99)
* OpenAI token usage and cost
* QStash job queue depth
* User signup and retention

**Alerts**

* Error rate spikes (>5% failure rate)
* High API latency (>3s p95)
* QStash job failures
* OAuth token expiration warnings
* Cost threshold alerts

**Cost Monitoring**

* OpenAI usage per user
* QStash message volume
* Database storage and queries
* Vercel function invocations

---

## 10. Testing & QA Strategy

**Unit Tests**

* Helper functions (`lib/`)
* OAuth code and token refresh
* Prompt logic and template generation
* Validation functions

**Integration / API Tests**

* Endpoint behavior
* Boundary cases (empty content, max length)
* Error handling
* Authentication flows

**E2E Tests (Playwright)**

* Login flow
* Content adaptation
* Post scheduling
* OAuth connections
* Post retry flow

**Testing Best Practices**

* Mock third-party APIs (OpenAI, Twitter, LinkedIn)
* Use Supabase test projects
* QStash sandbox mode
* CI runs lint, type checks, tests on PRs

**Test Coverage Goals**

* Unit tests: >80%
* API routes: 100%
* Critical paths: 100% E2E coverage

---

## 11. Deployment, Environments & Secrets

### Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| `development` | local | localhost:3000 | Local dev with `.env.local` |
| `preview` | PR branches | vercel-preview-*.vercel.app | PR previews |
| `production` | `main` | repurpose-orpin.vercel.app | Live app |

### Secrets / Environment Variables

**Supabase**

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

**OpenAI**

* `OPENAI_API_KEY`

**Twitter OAuth**

* `TWITTER_CLIENT_ID`
* `TWITTER_CLIENT_SECRET`

**LinkedIn OAuth**

* `LINKEDIN_CLIENT_ID`
* `LINKEDIN_CLIENT_SECRET`

**QStash**

* `QSTASH_TOKEN`
* `QSTASH_CURRENT_SIGNING_KEY`
* `QSTASH_NEXT_SIGNING_KEY`
* `QSTASH_URL` (optional)

**App Configuration**

* `NEXT_PUBLIC_APP_URL` (for OAuth callbacks)
* `NODE_ENV` (production/development)

**Optional**

* `SENTRY_DSN`
* `VERCEL_URL` (auto-set by Vercel)

### CI/CD

* **Main branch**: Auto-deploy to production on merge
* **PRs**: Preview deployments with unique URLs
* **Secret Management**: Vercel environment variables
* **Pre-deploy**: Lint, type check, tests must pass

---

## 12. Known Risks & Tradeoffs

**Technical Risks**

* **Latency**: Content adaptation may take 2-5 seconds (OpenAI API)
* **Cost**: OpenAI expenses scale with usage (~$0.01-0.05 per adaptation)
* **Token Expiry**: Twitter/LinkedIn tokens need refresh logic
* **API Rate Limits**: Twitter (50 posts/24h user context), LinkedIn (100 posts/day)
* **Single Region**: Vercel edge functions, but DB in single region
* **Serverless Timeouts**: 10s limit on Vercel hobby plan

**Product Tradeoffs**

* MVP doesn't support media uploads (images/video)
* No team collaboration or role permissions
* No analytics dashboard or engagement metrics
* No content calendar UI
* Manual retry only (no auto-retry for failed posts)

**Mitigation Strategies**

* Cache common adaptations
* Implement request queuing for rate limits
* Token refresh automation
* Fallback to basic templates if OpenAI fails
* User communication about limitations

---

## 13. Roadmap & Milestones (post-MVP)

### Phase 2: Enhanced Content

* [ ] Image upload and adaptation
* [ ] Video support (short-form)
* [ ] Link preview cards
* [ ] Hashtag suggestions
* [ ] Emoji support

### Phase 3: Advanced Features

* [ ] Team/role permissions
* [ ] Content calendar UI
* [ ] Analytics dashboard (engagement, reach)
* [ ] Auto-retry for failed posts
* [ ] Bulk scheduling
* [ ] Recurring posts

### Phase 4: Platform Expansion

* [ ] Instagram support
* [ ] Facebook support
* [ ] TikTok support (if API available)
* [ ] YouTube community posts

### Phase 5: Automation & AI

* [ ] Template marketplace
* [ ] Content recycling/reposting
* [ ] AI-suggested posting times
* [ ] A/B testing for content
* [ ] Content performance predictions

### Future Considerations

* [ ] Mobile app (React Native)
* [ ] Browser extension
* [ ] API for third-party integrations
* [ ] White-label solution

---

## 14. Appendices & Diagrams

### Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Next.js API    │
│   Routes        │
└────┬─────┬──────┘
     │     │
     │     ▼
     │  ┌──────────┐
     │  │ OpenAI   │
     │  │   API    │
     │  └──────────┘
     │
     ▼
┌─────────────┐      ┌──────────┐
│  Supabase   │◄─────┤  QStash  │
│     DB      │      │ (Upstash)│
└─────────────┘      └────┬─────┘
                          │
                          ▼
                     ┌──────────┐
                     │ Twitter  │
                     │ LinkedIn │
                     │   APIs   │
                     └──────────┘
```

### Content Adaptation Flow

```
1. User enters content → `/api/adapt`
2. Validate & sanitize input
3. Call OpenAI with platform-specific prompts
4. Return adapted content for each platform
5. User reviews and edits
6. User clicks "Schedule"
7. POST `/api/schedule` → Insert to DB
8. Schedule QStash job with delay
9. QStash calls `/api/post/execute` at scheduled time
10. Publish to platform API
11. Update post status in DB
```

### OAuth Flow (Twitter)

```
1. User clicks "Connect Twitter"
2. Generate PKCE code_verifier and code_challenge
3. Redirect to Twitter OAuth with code_challenge
4. User authorizes app
5. Twitter redirects to callback with code
6. Exchange code + code_verifier for tokens
7. Store tokens in social_accounts table
8. Redirect user to dashboard
```

### RLS Policy Example

```sql
-- posts table policy
CREATE POLICY "Users can only access their own posts"
ON posts
FOR ALL
USING (auth.uid() = user_id);

-- social_accounts table policy
CREATE POLICY "Users can only access their own accounts"
ON social_accounts
FOR ALL
USING (auth.uid() = user_id);
```

### Prompt Versioning Log

| Version | Date | Changes | Platforms |
|---------|------|---------|-----------|
| 1.0 | 2025-10-01 | Initial prompts | Twitter, LinkedIn |
| 1.1 | 2025-10-05 | Added tone variations | Twitter, LinkedIn |
| 1.2 | 2025-10-09 | Improved hashtag logic | Twitter |

---

## Quick Reference

**Key Files**

* [`lib/openai.ts`](lib/openai.ts) - OpenAI client and adaptation logic
* [`lib/supabase.ts`](lib/supabase.ts) - Supabase client configuration
* [`lib/qstash.ts`](lib/qstash.ts) - QStash client and scheduling
* [`middleware.ts`](middleware.ts) - Auth and route protection
* [`.env.example`](.env.example) - Environment variable template

**Key Commands**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm test             # Run tests
```

**Key URLs**

* Production: https://repurpose-orpin.vercel.app
* Supabase: https://supabase.com/dashboard/project/qdmmztwgfqvajhrnikho
* Vercel: https://vercel.com/chudi-nnorukams-projects/repurpose
* Upstash: https://console.upstash.com/qstash

---

**Document Maintenance**

* Update version number on major changes
* Update "Last Updated" date
* Review quarterly for accuracy
* Link to this doc from README and CLAUDE.md
