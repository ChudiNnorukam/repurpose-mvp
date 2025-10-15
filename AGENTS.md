# Repurpose - Codex-GPT-5 Agent Orchestration

**Version**: 1.0.0
**Last Updated**: October 13, 2025
**Purpose**: Codex-GPT-5 agent workflows (local & cloud) complementary to Claude Code AI

---

## Table of Contents

1. [Overview & Philosophy](#1-overview--philosophy)
2. [Agent Types & Deployment Modes](#2-agent-types--deployment-modes)
3. [Local Agent Workflows](#3-local-agent-workflows)
4. [Cloud Agent Workflows](#4-cloud-agent-workflows)
5. [Claude ↔ Codex Synergy Patterns](#5-claude--codex-synergy-patterns)
6. [Code Generation Agents](#6-code-generation-agents)
7. [Refactoring & Optimization Agents](#7-refactoring--optimization-agents)
8. [Documentation Generation Agents](#8-documentation-generation-agents)
9. [Testing & Fixture Agents](#9-testing--fixture-agents)
10. [Data Pipeline Agents](#10-data-pipeline-agents)
11. [Configuration & Infrastructure Agents](#11-configuration--infrastructure-agents)
12. [Integration Patterns](#12-integration-patterns)

---

## 1. Overview & Philosophy

### 1.1 The Claude-Codex Symbiosis

**Claude Code** (Strategic Orchestrator):
- Architectural decisions and system design
- Complex workflow orchestration
- Security implementation and audits
- OAuth and authentication flows
- Database schema design
- Frontend UX design and component architecture
- Debugging and troubleshooting complex issues
- Code review and quality assurance

**Codex-GPT-5** (Tactical Executor):
- Code generation and scaffolding
- Boilerplate and utility generation
- Documentation generation from code
- Refactoring and optimization
- Test generation and fixtures
- Data pipeline building
- Configuration management
- Performance profiling and optimization

### 1.2 When to Use Codex vs Claude

```
┌─────────────────────────────────────────────────────────────────┐
│                    Task Decision Matrix                          │
├─────────────────────────────────────────────────────────────────┤
│ Task Type                    │ Primary Agent │ Secondary Agent  │
├──────────────────────────────┼───────────────┼──────────────────┤
│ Architect new feature        │ Claude        │ Codex (impl)     │
│ Generate boilerplate code    │ Codex         │ Claude (review)  │
│ Design database schema       │ Claude        │ Codex (migration)│
│ Write unit tests             │ Codex         │ Claude (strategy)│
│ Implement OAuth flow         │ Claude        │ Codex (helpers)  │
│ Generate JSDoc comments      │ Codex         │ N/A              │
│ Refactor for performance     │ Codex         │ Claude (verify)  │
│ Security audit               │ Claude        │ Codex (fixes)    │
│ Build data pipeline          │ Codex         │ Claude (design)  │
│ Create test fixtures         │ Codex         │ N/A              │
│ Generate API docs            │ Codex         │ Claude (review)  │
│ Optimize bundle size         │ Codex         │ Claude (strategy)│
└──────────────────────────────┴───────────────┴──────────────────┘
```

### 1.3 Deployment Modes

**Local Mode** (Development Machine):
- Fast iteration cycles
- No API costs
- Privacy-preserving for sensitive code
- Limited context window
- Best for: code generation, refactoring, test writing

**Cloud Mode** (API):
- Larger context windows
- More powerful models
- Collaborative workflows
- API costs per request
- Best for: complex refactors, large-scale generation, documentation

---

## 2. Agent Types & Deployment Modes

### 2.1 Local Agent Configuration

```yaml
# .codex/config.yml
agents:
  code_generator:
    mode: local
    model: codex-gpt-5-local
    context_window: 8192
    temperature: 0.2  # Low for deterministic code

  test_generator:
    mode: local
    model: codex-gpt-5-local
    context_window: 4096
    temperature: 0.1  # Very low for consistent tests

  doc_generator:
    mode: local
    model: codex-gpt-5-local
    context_window: 4096
    temperature: 0.3  # Slightly higher for natural language

  refactor_optimizer:
    mode: local
    model: codex-gpt-5-local
    context_window: 8192
    temperature: 0.2
```

### 2.2 Cloud Agent Configuration

```yaml
# .codex/config.yml (continued)
cloud_agents:
  large_refactor:
    mode: cloud
    model: codex-gpt-5-cloud
    context_window: 32768
    temperature: 0.2
    api_endpoint: https://api.openai.com/v1/completions

  documentation_suite:
    mode: cloud
    model: codex-gpt-5-cloud
    context_window: 16384
    temperature: 0.3

  data_pipeline_builder:
    mode: cloud
    model: codex-gpt-5-cloud
    context_window: 16384
    temperature: 0.2
```

### 2.3 Hybrid Workflows

```yaml
# Example: Generate code locally, review in cloud
hybrid_workflows:
  feature_implementation:
    steps:
      - agent: code_generator (local)
        task: Generate initial implementation
      - agent: test_generator (local)
        task: Generate test suite
      - agent: large_refactor (cloud)
        task: Optimize and refactor
      - handoff: claude
        task: Security review and integration
```

---

## 3. Local Agent Workflows

### 3.1 Code Generator Agent (Local)

**Primary Function**: Generate boilerplate, utilities, and implementation scaffolding

**Usage Pattern**:
```bash
# CLI invocation
codex generate api-route \
  --path "app/api/analytics/route.ts" \
  --method POST \
  --auth required \
  --rate-limit "30/minute"

# Output: Complete API route with auth, validation, error handling
```

**Example Workflow**:
```typescript
// Input: Specification
interface ApiRouteSpec {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  auth: boolean
  rateLimit?: string
  validation?: Record<string, string>
}

// Codex Local Agent Output:
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ErrorResponses } from '@/lib/api/errors'
import { checkRateLimit, apiRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return ErrorResponses.unauthorized()
    }

    // Rate limiting (30/minute)
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', reset: rateLimitResult.reset },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // Parse and validate input
    const body = await request.json()
    // TODO: Add validation logic

    // Business logic
    // TODO: Implement analytics logic

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in /api/analytics:', error)
    return ErrorResponses.internalError(error.message)
  }
}
```

**When to use**:
- Creating new API routes with standard patterns
- Generating utility functions
- Creating type definitions from specifications
- Scaffolding component structures

**Handoff to Claude**:
- Security review of generated code
- Integration with existing systems
- Complex business logic implementation

---

### 3.2 Test Generator Agent (Local)

**Primary Function**: Generate unit tests, integration tests, and test fixtures

**Usage Pattern**:
```bash
# Generate unit tests for a module
codex generate tests \
  --file "lib/twitter.ts" \
  --coverage "functions" \
  --framework jest

# Generate E2E test for a flow
codex generate e2e-test \
  --flow "post-scheduling" \
  --framework playwright
```

**Example Workflow**:
```typescript
// Input: Function to test
// lib/twitter.ts
export function generatePKCE() {
  const verifier = crypto.randomBytes(64).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

// Codex Local Agent Output:
// lib/__tests__/twitter.test.ts
import { generatePKCE } from '../twitter'

describe('Twitter OAuth', () => {
  describe('generatePKCE', () => {
    it('should generate a verifier of correct length', () => {
      const { verifier } = generatePKCE()
      expect(verifier).toHaveLength(128)
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate a valid challenge', () => {
      const { challenge } = generatePKCE()
      expect(challenge).toHaveLength(43)
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate unique verifiers on each call', () => {
      const result1 = generatePKCE()
      const result2 = generatePKCE()
      expect(result1.verifier).not.toBe(result2.verifier)
      expect(result1.challenge).not.toBe(result2.challenge)
    })

    it('should generate deterministic challenge from verifier', () => {
      // Manual verification that SHA-256 is used correctly
      const { verifier, challenge } = generatePKCE()
      const crypto = require('crypto')
      const expectedChallenge = crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64url')
      expect(challenge).toBe(expectedChallenge)
    })
  })
})
```

**When to use**:
- Generating test suites for new modules
- Creating test fixtures and mock data
- Scaffolding E2E test flows
- Generating edge case tests

**Handoff to Claude**:
- Test strategy and coverage planning
- Integration test orchestration
- Complex mock scenarios

---

### 3.3 Refactor Optimizer Agent (Local)

**Primary Function**: Refactor code for readability, performance, and maintainability

**Usage Pattern**:
```bash
# Refactor a file for performance
codex refactor optimize \
  --file "app/api/posts/route.ts" \
  --goals "performance,readability" \
  --preserve-behavior true

# Extract reusable utilities
codex refactor extract \
  --file "app/api/adapt/route.ts" \
  --target "validation logic" \
  --output "lib/validation.ts"
```

**Example Workflow**:
```typescript
// Input: Original code with duplication
// Before refactoring
export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.platform || typeof body.platform !== 'string') {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  if (!['twitter', 'linkedin', 'instagram'].includes(body.platform)) {
    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
  }

  if (!body.content || typeof body.content !== 'string') {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  if (body.content.length > 5000) {
    return NextResponse.json({ error: 'Content too long' }, { status: 400 })
  }

  // ... rest of logic
}

// Codex Local Agent Output (refactored):
// lib/validation.ts
import { Platform } from './types'
import { ErrorResponses, ErrorCode, createErrorResponse } from './api/errors'

const VALID_PLATFORMS: Platform[] = ['twitter', 'linkedin', 'instagram']
const MAX_CONTENT_LENGTH = 5000

export interface ValidationResult {
  valid: boolean
  error?: NextResponse
}

export function validatePlatform(platform: unknown): ValidationResult {
  if (!platform || typeof platform !== 'string') {
    return {
      valid: false,
      error: createErrorResponse('Invalid platform', ErrorCode.INVALID_INPUT, 400, undefined, 'platform')
    }
  }

  if (!VALID_PLATFORMS.includes(platform as Platform)) {
    return {
      valid: false,
      error: createErrorResponse(
        `Unsupported platform: ${platform}. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
        ErrorCode.INVALID_PLATFORM,
        400,
        undefined,
        'platform'
      )
    }
  }

  return { valid: true }
}

export function validateContent(content: unknown): ValidationResult {
  if (!content || typeof content !== 'string') {
    return {
      valid: false,
      error: ErrorResponses.missingField('content')
    }
  }

  const trimmed = content.trim()

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: createErrorResponse('Content cannot be empty', ErrorCode.INVALID_INPUT, 400, undefined, 'content')
    }
  }

  if (trimmed.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      error: ErrorResponses.contentTooLong(MAX_CONTENT_LENGTH)
    }
  }

  return { valid: true }
}

// app/api/posts/route.ts (after refactoring)
import { validatePlatform, validateContent } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate platform
  const platformValidation = validatePlatform(body.platform)
  if (!platformValidation.valid) {
    return platformValidation.error!
  }

  // Validate content
  const contentValidation = validateContent(body.content)
  if (!contentValidation.valid) {
    return contentValidation.error!
  }

  // ... rest of logic with validated inputs
}
```

**When to use**:
- Extracting reusable utilities
- Optimizing hot paths
- Reducing code duplication
- Improving type safety

**Handoff to Claude**:
- Architectural refactoring decisions
- Breaking changes requiring system-wide updates
- Performance verification and profiling

---

## 4. Cloud Agent Workflows

### 4.1 Large Refactor Agent (Cloud)

**Primary Function**: Large-scale refactoring across multiple files

**Usage Pattern**:
```bash
# Refactor across entire codebase
codex cloud refactor-suite \
  --scope "app/api/**/*.ts" \
  --pattern "error-handling" \
  --output "refactor-plan.json" \
  --dry-run

# Apply refactoring
codex cloud apply-refactor \
  --plan "refactor-plan.json" \
  --confirm
```

**Example Workflow**:
```json
// refactor-plan.json (generated by cloud agent)
{
  "refactoring_type": "standardize_error_handling",
  "scope": "app/api/**/*.ts",
  "files_affected": 16,
  "changes": [
    {
      "file": "app/api/adapt/route.ts",
      "line": 118,
      "before": "console.error('Error:', error)\nreturn NextResponse.json({ error: 'Failed' }, { status: 500 })",
      "after": "logger.error('Error in /api/adapt:', error)\nreturn ErrorResponses.internalError(error.message)",
      "reason": "Standardize error logging and response format"
    },
    // ... 47 more changes
  ],
  "breaking_changes": [],
  "test_updates_required": ["tests/api/adapt.spec.ts"],
  "estimated_time": "15 minutes"
}
```

**When to use**:
- Migrating to new patterns across codebase
- Large-scale type updates
- Standardizing error handling
- Updating deprecated API usage

**Handoff to Claude**:
- Review refactoring plan before execution
- Verify no security implications
- Update architecture documentation

---

### 4.2 Documentation Suite Agent (Cloud)

**Primary Function**: Generate comprehensive documentation from codebase

**Usage Pattern**:
```bash
# Generate API documentation
codex cloud generate-docs \
  --type api \
  --scope "app/api" \
  --output "docs/API.md" \
  --include-examples

# Generate architecture diagrams
codex cloud generate-diagrams \
  --type sequence \
  --flows "content-adaptation,post-scheduling,oauth" \
  --format mermaid
```

**Example Workflow**:
```typescript
// Input: API route code
// app/api/adapt/route.ts (exists in codebase)

// Codex Cloud Agent Output:
// docs/API.md
```

```markdown
# API Documentation

## POST /api/adapt

Adapts user content for multiple social media platforms using AI.

### Authentication
Required. Must include valid JWT token in Authorization header.

### Rate Limiting
10 requests per hour per user.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Original content to adapt (max 5000 chars) |
| tone | string | Yes | Tone for adaptation: professional, casual, friendly, authoritative, enthusiastic |
| platforms | string[] | Yes | Target platforms: twitter, linkedin, instagram |

### Request Example

```json
{
  "content": "Just launched our new feature!",
  "tone": "enthusiastic",
  "platforms": ["twitter", "linkedin"]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "adaptedContent": [
    {
      "platform": "twitter",
      "content": "🚀 We just dropped something HUGE...\n\nOur new feature is live.\n\n(And it's going to change everything)\n\nTry it: [link]"
    },
    {
      "platform": "linkedin",
      "content": "Excited to announce the launch of our new feature.\n\nAfter 6 months of development, we're bringing you:\n→ Faster performance\n→ Better UX\n→ More control\n\nCheck it out and let us know what you think 👇"
    }
  ]
}
```

### Error Responses

#### 401 Unauthorized
```json
{ "error": "Unauthorized", "code": "UNAUTHORIZED" }
```

#### 429 Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded. You can make 10 requests per hour. Try again after 3:45 PM.",
  "code": "RATE_LIMIT_EXCEEDED",
  "limit": 10,
  "remaining": 0,
  "reset": 1735689900000
}
```

#### 400 Bad Request
```json
{ "error": "Missing required field: content", "code": "INVALID_INPUT" }
```

### Implementation Notes

- Content is sanitized to remove code blocks and system tags
- Adaptation happens in parallel for all platforms
- OpenAI GPT-4o model is used with platform-specific prompts
- Responses are cached for 5 minutes (future feature)

### Related Endpoints

- `POST /api/schedule` - Schedule adapted content
- `POST /api/post/execute` (`app/api/post/execute/route.ts`) - QStash callback endpoint (jobs publish to `/api/post/execute`)
- `POST /api/post/retry` (`app/api/post/retry/route.ts`) - Manual retry handler (supersedes the old `app/api/post/route.ts` doc references)
- `GET /api/posts` - View scheduled posts
```

**When to use**:
- Generating API documentation
- Creating architecture diagrams
- Documenting database schemas
- Writing onboarding guides

**Handoff to Claude**:
- Review documentation accuracy
- Add architectural context
- Integrate with existing docs

---

### 4.3 Data Pipeline Builder Agent (Cloud)

**Primary Function**: Build ETL pipelines, data transformations, and batch operations

**Usage Pattern**:
```bash
# Generate data pipeline for analytics
codex cloud build-pipeline \
  --source "posts table" \
  --transform "aggregate by platform" \
  --destination "analytics dashboard" \
  --schedule "daily 2am"

# Generate migration script
codex cloud generate-migration \
  --from "old_posts schema" \
  --to "new_posts schema" \
  --preserve-data true
```

**Example Workflow**:
```typescript
// Input: Pipeline specification
interface PipelineSpec {
  name: 'daily_analytics_aggregation'
  source: 'posts table (Supabase)'
  transformations: [
    'group by platform',
    'count successful/failed posts',
    'calculate success rate',
    'identify trending content'
  ]
  destination: 'analytics table'
  schedule: 'daily at 2am UTC'
}

// Codex Cloud Agent Output:
// app/api/cron/aggregate-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySignature } from '@upstash/qstash/nextjs'
import { logger } from '@/lib/logger'

async function handler(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    // Get yesterday's date range
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch posts from yesterday
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('platform, status, posted_at, adapted_content')
      .gte('posted_at', yesterday.toISOString())
      .lt('posted_at', today.toISOString())

    if (fetchError) {
      throw new Error(`Failed to fetch posts: ${fetchError.message}`)
    }

    // Aggregate by platform
    const analytics = posts.reduce((acc, post) => {
      const platform = post.platform

      if (!acc[platform]) {
        acc[platform] = {
          total: 0,
          successful: 0,
          failed: 0,
          success_rate: 0
        }
      }

      acc[platform].total++

      if (post.status === 'posted') {
        acc[platform].successful++
      } else if (post.status === 'failed') {
        acc[platform].failed++
      }

      acc[platform].success_rate =
        (acc[platform].successful / acc[platform].total) * 100

      return acc
    }, {} as Record<string, any>)

    // Store aggregated analytics
    const analyticsRecords = Object.entries(analytics).map(([platform, stats]) => ({
      date: yesterday.toISOString().split('T')[0],
      platform,
      total_posts: stats.total,
      successful_posts: stats.successful,
      failed_posts: stats.failed,
      success_rate: stats.success_rate,
      created_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabase
      .from('daily_analytics')
      .upsert(analyticsRecords, {
        onConflict: 'date,platform',
        ignoreDuplicates: false
      })

    if (insertError) {
      throw new Error(`Failed to insert analytics: ${insertError.message}`)
    }

    logger.info('Daily analytics aggregation completed', {
      date: yesterday.toISOString().split('T')[0],
      platforms: Object.keys(analytics),
      total_posts: posts.length
    })

    return NextResponse.json({
      success: true,
      date: yesterday.toISOString().split('T')[0],
      analytics
    })
  } catch (error: any) {
    logger.error('Failed to aggregate analytics', error)
    return NextResponse.json(
      { error: 'Failed to aggregate analytics', details: error.message },
      { status: 500 }
    )
  }
}

export const POST = verifySignature(handler)
```

**When to use**:
- Building ETL pipelines
- Creating batch operations
- Generating data migration scripts
- Implementing aggregation jobs

**Handoff to Claude**:
- Review data transformation logic
- Validate data integrity
- Design aggregation strategy

---

## 5. Claude ↔ Codex Synergy Patterns

### 5.1 Sequential Handoff Pattern

**Workflow**: Claude designs → Codex implements → Claude reviews

```
Example: Adding Instagram support

1. Claude (Strategic):
   - Design OAuth flow architecture
   - Define data schema changes
   - Specify security requirements
   - Create implementation checklist

2. Codex (Tactical):
   - Generate Instagram OAuth routes
   - Create database migration
   - Generate test fixtures
   - Implement posting logic

3. Claude (Review):
   - Security audit generated code
   - Verify OAuth implementation
   - Test integration with existing system
   - Update documentation
```

### 5.2 Parallel Collaboration Pattern

**Workflow**: Claude and Codex work on different aspects simultaneously

```
Example: Performance optimization

Claude (in parallel):                 Codex (in parallel):
- Identify bottlenecks               - Refactor slow functions
- Design caching strategy            - Generate performance tests
- Plan database indexes              - Optimize bundle size
                                     - Generate profiling code

Merge Point:
- Claude reviews Codex optimizations
- Codex generates migration scripts from Claude's index design
- Claude verifies performance gains
```

### 5.3 Iterative Refinement Pattern

**Workflow**: Multiple rounds of Claude design + Codex implementation

```
Example: Complex feature implementation

Round 1:
- Claude: Initial design (60% confidence)
- Codex: Generate prototype
- Test: Identify issues

Round 2:
- Claude: Refine design based on issues
- Codex: Regenerate with improvements
- Test: Better but still gaps

Round 3:
- Claude: Final design (95% confidence)
- Codex: Final implementation
- Test: Ship to production
```

---

## 6. Code Generation Agents

### 6.1 API Route Generator

```bash
codex generate api-route \
  --pattern standard \
  --features "auth,rate-limit,validation"
```

**Output**: Complete API route with standardized patterns

### 6.2 Component Generator

```bash
codex generate component \
  --name PostCard \
  --type functional \
  --features "typescript,framer-motion,responsive"
```

**Output**: React component with TypeScript, animations, and responsive design

### 6.3 Type Definition Generator

```bash
codex generate types \
  --from "database schema" \
  --output "lib/database.types.ts"
```

**Output**: TypeScript types from database schema

---

## 7. Refactoring & Optimization Agents

### 7.1 Performance Optimizer

```bash
codex refactor optimize-performance \
  --file "app/api/posts/route.ts" \
  --metrics "response-time,memory"
```

**Output**: Optimized code with performance improvements

### 7.2 Bundle Size Optimizer

```bash
codex refactor optimize-bundle \
  --target 300kb \
  --analyze "components,libraries"
```

**Output**: Code-splitting strategies and lazy loading implementations

---

## 8. Documentation Generation Agents

### 8.1 JSDoc Generator

```bash
codex generate jsdoc \
  --scope "lib/**/*.ts" \
  --include-examples
```

**Output**: Comprehensive JSDoc comments for all functions

### 8.2 README Generator

```bash
codex generate readme \
  --include "setup,usage,api,deployment"
```

**Output**: Comprehensive README.md with all sections

---

## 9. Testing & Fixture Agents

### 9.1 Test Suite Generator

```bash
codex generate test-suite \
  --module "lib/twitter.ts" \
  --coverage 95 \
  --include "edge-cases,error-handling"
```

**Output**: Comprehensive test suite with edge cases

### 9.2 Mock Data Generator

```bash
codex generate fixtures \
  --type posts \
  --count 100 \
  --realistic true
```

**Output**: Realistic test fixtures

---

## 10. Data Pipeline Agents

### 10.1 ETL Pipeline Generator

```bash
codex generate pipeline \
  --name analytics-aggregation \
  --schedule daily
```

**Output**: Complete ETL pipeline with cron job

### 10.2 Migration Script Generator

```bash
codex generate migration \
  --from "old_schema" \
  --to "new_schema" \
  --preserve-data
```

**Output**: Safe migration script with rollback

---

## 11. Configuration & Infrastructure Agents

### 11.1 Environment Config Generator

```bash
codex generate env-config \
  --environments "dev,staging,prod" \
  --secure
```

**Output**: Environment configuration files

### 11.2 CI/CD Pipeline Generator

```bash
codex generate ci-cd \
  --platform github-actions \
  --steps "test,build,deploy"
```

**Output**: GitHub Actions workflow file

---

## 12. Integration Patterns

### 12.1 IDE Integration

```json
// .vscode/settings.json
{
  "codex.agents.enabled": true,
  "codex.agents.mode": "local",
  "codex.agents.autoSuggest": true,
  "codex.agents.triggerKeys": ["ctrl+space"]
}
```

### 12.2 Git Hooks Integration

```bash
# .git/hooks/pre-commit
#!/bin/bash
# Auto-generate tests for changed files
codex generate tests --changed-files

# Auto-generate JSDoc for new functions
codex generate jsdoc --new-functions

# Run refactoring suggestions
codex refactor suggest --changed-files
```

### 12.3 CLI Workflow

```bash
# Morning workflow
codex sync-claude      # Pull latest Claude designs
codex generate pending # Generate code from specs
codex test all         # Run generated tests
codex review suggest   # Get improvement suggestions

# Commit workflow
codex generate docs    # Update documentation
codex generate tests   # Generate missing tests
git commit -m "feat: implement feature"
codex push-to-claude   # Send for Claude review
```

---

## Appendix A: Configuration Files

### .codexrc

```yaml
# Codex configuration
version: 1.0.0
mode: hybrid  # local, cloud, hybrid

agents:
  code_generator:
    enabled: true
    mode: local
    triggers: ["generate", "scaffold", "create"]

  test_generator:
    enabled: true
    mode: local
    coverage_threshold: 80

  doc_generator:
    enabled: true
    mode: cloud
    formats: ["jsdoc", "markdown", "api-docs"]

  refactor_optimizer:
    enabled: true
    mode: hybrid
    auto_suggest: false

integration:
  ide: vscode
  vcs: git
  ci_cd: github-actions

  claude_sync:
    enabled: true
    endpoint: localhost:8000
    auto_review: true
```

---

## Appendix B: Best Practices

### When to Use Local vs Cloud

**Use Local When**:
- Rapid iteration on small files
- Privacy-sensitive code
- Offline development
- Cost optimization

**Use Cloud When**:
- Large-scale refactoring
- Multi-file operations
- Complex documentation generation
- Data pipeline building

### Claude-Codex Handoff Protocol

1. **Claude Designs**: Create detailed specification
2. **Codex Implements**: Generate code from spec
3. **Claude Reviews**: Security, architecture, integration
4. **Codex Refines**: Apply review feedback
5. **Claude Approves**: Final verification
6. **Codex Documents**: Generate docs and tests

---

**Document Maintenance:**
- Update when adding new agent types
- Review quarterly for accuracy
- Keep in sync with CLAUDE.md
- Document new integration patterns

**Last Reviewed**: October 13, 2025
**Next Review**: January 13, 2026
