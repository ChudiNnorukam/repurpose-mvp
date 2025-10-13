# Architecture Decision Records (ADRs)

**Purpose**: Record significant architectural decisions and their rationale
**Format**: ADR-### format with context, decision, consequences
**Last Updated**: October 13, 2025

---

## ADR-001: Context Bridge System (2025-10-13)

**Status**: Approved by user
**Context**: Need seamless handoff between Claude (strategic) and Codex (tactical) agents

**Decision**:
- Created `.ai-context/` directory for shared context
- Implemented 3-file system: handoff.json, active-session.json, patterns.md
- Both agents read/write to shared context files
- Explicit handoff protocol via handoff.json

**Consequences**:
- **Positive**: Zero context loss when switching agents
- **Positive**: Clear audit trail of all decisions
- **Positive**: Both agents can work with full project knowledge
- **Negative**: Requires discipline to update context files
- **Negative**: Files must be kept in sync

**Implementation**:
- Files: `.ai-context/*`
- Documentation: `.ai-context/README.md`, `.ai-context/CONTEXT-BRIDGE.md`
- Updated: CLAUDE.md, AGENTS.md

**Related**: Foundation for all future multi-agent workflows

---

## ADR-002: Rate Limiting Strategy (2025-10-13)

**Status**: Implemented
**Context**: Needed to prevent API abuse and manage costs

**Decision**:
- AI adaptation: 10 requests/hour per user (Upstash Redis sliding window)
- API endpoints: 30 requests/minute per user
- QStash signature verification for all callbacks
- User-specific rate limits (no global limits)

**Consequences**:
- **Positive**: Protects against abuse
- **Positive**: Manageable OpenAI costs
- **Positive**: Fair per-user limits
- **Negative**: Free tier users may hit limits during testing
- **Negative**: Redis dependency (Upstash)

**Implementation**:
- File: `lib/rate-limit.ts`
- Used in: All protected API routes
- Dependencies: `@upstash/ratelimit`, `@upstash/redis`

**Related**: ADR-003 (OpenAI cost management)

---

## ADR-003: OpenAI Integration (2025-10-01)

**Status**: Implemented
**Context**: Need AI-powered content adaptation with humanization

**Decision**:
- Use OpenAI GPT-4o model (not Claude, despite lib/anthropic.ts naming)
- Implement 5-axis viral framework (Hook, Body, CTA, Intention, Style)
- Platform-specific prompts for Twitter, LinkedIn, Instagram
- Humanization protocol (de-polished, raw, authentic)
- Temperature: 0.7 for natural variation

**Consequences**:
- **Positive**: High-quality, platform-native adaptations
- **Positive**: Authentic, non-AI-sounding content
- **Positive**: Viral content optimization built-in
- **Negative**: Cost: ~$0.01-0.05 per adaptation
- **Negative**: Response latency: 3-5 seconds
- **Negative**: Misleading filename (lib/anthropic.ts should be lib/openai.ts)

**Implementation**:
- File: `lib/anthropic.ts` (TODO: rename to lib/openai.ts)
- Route: `app/api/adapt/route.ts`
- Model: `gpt-4o`

**Related**: ADR-002 (rate limiting), ADR-004 (content guidelines)

---

## ADR-004: Humanization Protocol (2025-10-01)

**Status**: Implemented
**Context**: AI-generated content often sounds robotic; need authenticity

**Decision**:
- "2AM journaling" style (raw, introspective, unpolished)
- Allow sentence breaks, interruptions, false starts
- Forbidden: em dashes, overly polished conclusions
- Embed self-doubt, meta-notes, sensory details
- Vary register (casual → formal → poetic)

**Consequences**:
- **Positive**: Content feels genuinely human
- **Positive**: Higher engagement (users report "I feel seen")
- **Positive**: Differentiates from competitors
- **Negative**: Subjective quality (hard to measure)
- **Negative**: May not suit all brand voices

**Implementation**:
- File: `lib/anthropic.ts` (prompt engineering)
- Platform guidelines: Twitter, LinkedIn, Instagram
- Examples: See prompt in lib/anthropic.ts:65-139

**Related**: ADR-003 (OpenAI integration)

---

## ADR-005: QStash for Job Scheduling (2025-10-01)

**Status**: Implemented
**Context**: Need reliable delayed job execution for scheduled posts

**Decision**:
- Use Upstash QStash instead of cron jobs or custom queue
- Store qstash_message_id in posts table for cancellation
- Verify QStash signatures on callbacks
- Callback endpoint: `/api/post/execute`

**Consequences**:
- **Positive**: Serverless-friendly (no long-running processes)
- **Positive**: Reliable delivery with retries
- **Positive**: Simple cancellation/rescheduling
- **Negative**: Dependency on external service
- **Negative**: Debugging delayed jobs is harder

**Implementation**:
- File: `lib/qstash.ts`
- Route: `app/api/post/execute/route.ts`
- Scheduling: `app/api/schedule/route.ts`

**Related**: ADR-006 (OAuth token refresh)

---

## ADR-006: OAuth Token Storage (2025-10-02)

**Status**: Implemented
**Context**: Need secure storage and refresh of OAuth tokens

**Decision**:
- Store tokens in `social_accounts` table (Supabase)
- Implement just-in-time token refresh before posting
- Use PKCE for Twitter OAuth 2.0
- Standard OAuth 2.0 for LinkedIn
- Encrypt tokens at rest (Supabase encryption)

**Consequences**:
- **Positive**: Secure token storage
- **Positive**: Automatic refresh prevents auth failures
- **Positive**: PKCE prevents authorization code interception
- **Negative**: Complex token refresh logic
- **Negative**: Refresh failures require user re-auth

**Implementation**:
- Tables: `social_accounts`
- Files: `lib/twitter.ts`, `lib/linkedin.ts`, `lib/social-media/refresh.ts`
- RLS policies: Users can only access their own tokens

**Related**: ADR-005 (QStash), ADR-007 (RLS policies)

---

## ADR-007: Row Level Security (RLS) Policies (2025-10-01)

**Status**: Implemented
**Context**: Multi-tenant app needs user data isolation

**Decision**:
- Enable RLS on `posts` and `social_accounts` tables
- Policy: `auth.uid() = user_id` for all operations
- Use Supabase client-side client for user-scoped queries
- Use admin client only for cross-user operations (cron jobs)

**Consequences**:
- **Positive**: Database-level security (can't bypass)
- **Positive**: Automatic enforcement (no manual checks)
- **Positive**: Multi-tenant without application logic
- **Negative**: Debugging is harder (silent failures)
- **Negative**: Admin queries need separate client

**Implementation**:
- Tables: `posts`, `social_accounts`
- Policies: See SOURCE_OF_TRUTH.md:511-523
- Files: `lib/supabase/client.ts`, `lib/supabase/server.ts`

**Related**: ADR-006 (OAuth tokens)

---

## ADR-008: Next.js 15 App Router (2025-10-01)

**Status**: Implemented
**Context**: Starting new project, choosing Next.js version

**Decision**:
- Use Next.js 15.5.4 with App Router
- TypeScript strict mode
- Turbopack for builds (faster than Webpack)
- React 19.1.0 (latest stable)
- Server Components by default, Client Components as needed

**Consequences**:
- **Positive**: Modern architecture, better performance
- **Positive**: RSC reduces client bundle size
- **Positive**: Turbopack builds are 5x faster
- **Negative**: Learning curve for App Router patterns
- **Negative**: Some libraries don't support React 19 yet

**Implementation**:
- Framework: Next.js 15.5.4
- Build: `next build --turbopack`
- Structure: `app/` directory with route.ts files

**Related**: ADR-009 (component architecture)

---

## ADR-009: Component Library (2025-10-01)

**Status**: Implemented
**Context**: Need UI components quickly without building from scratch

**Decision**:
- Use shadcn/ui (copy-paste components, not npm install)
- Tailwind CSS 4 for styling
- Framer Motion for animations
- class-variance-authority for component variants

**Consequences**:
- **Positive**: Own the component code (no black box)
- **Positive**: Easy customization
- **Positive**: No dependency bloat
- **Negative**: Manual updates (no npm update)
- **Negative**: Initial setup overhead

**Implementation**:
- Components: `components/ui/*`
- Config: `components.json`
- Docs: https://ui.shadcn.com

**Related**: ADR-008 (Next.js)

---

## ADR-010: Monolithic vs Microservices (2025-10-01)

**Status**: Monolith chosen
**Context**: Architecture decision for MVP

**Decision**:
- Single Next.js app (monolith)
- All features in one repository
- Serverless functions via Vercel
- External services: Supabase (DB), QStash (jobs), OpenAI (AI)

**Consequences**:
- **Positive**: Faster development for MVP
- **Positive**: Simpler deployment
- **Positive**: Easier debugging
- **Negative**: May need refactoring for scale
- **Negative**: All-or-nothing deploys

**Implementation**:
- Repo: Single Next.js app
- Deploy: Vercel (automatic)
- External: Supabase, QStash, OpenAI

**Related**: ADR-011 (deployment strategy)

---

## Template for New ADRs

```markdown
## ADR-###: Decision Title (YYYY-MM-DD)

**Status**: Proposed | Approved | Implemented | Deprecated
**Context**: Why are we making this decision? What problem does it solve?

**Decision**:
- What did we decide?
- Key implementation details

**Consequences**:
- **Positive**: Benefits
- **Negative**: Tradeoffs

**Implementation**:
- Files affected
- Dependencies
- Related code

**Related**: Link to related ADRs
```

---

**Maintained By**: Claude (strategic decisions)
**Review**: When making architectural changes
**Archive**: Deprecated ADRs to decisions-archive.md
