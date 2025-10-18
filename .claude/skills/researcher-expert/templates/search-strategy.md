# Search Strategy Templates

## PRISMA-Style Systematic Search

### Template Structure

```
1. Define Research Question
2. Generate Seed Queries (3-5)
3. Execute Searches
4. Screen Results
5. Fetch Full Text
6. Score Sources
7. Extract Evidence
8. Document Search Log
```

### Query Generation Patterns

**Pattern 1: Technical Implementation**
- Precise: `"[technology] [feature] official documentation"`
- Conceptual: `"[technology] [feature] best practices 2024"`
- Broad: `"[technology] [feature] tutorial guide"`

**Pattern 2: Standards/Compliance**
- Precise: `"RFC [number] [standard name]"`
- Conceptual: `"[standard] implementation guide"`
- Broad: `"[domain] standards specifications"`

**Pattern 3: Platform/Vendor**
- Precise: `site:[vendor.com] "[exact feature]"`
- Conceptual: `"[vendor] [feature] developer guide"`
- Broad: `"[vendor] API documentation"`

### Example: OAuth PKCE Research

**Research Question**: "What are the authoritative sources for implementing OAuth PKCE with token refresh in Next.js 15 + Supabase?"

**Seed Queries**:
1. `"RFC 7636 PKCE OAuth 2.0"` (standard)
2. `site:supabase.com "OAuth PKCE Next.js"` (vendor)
3. `"Next.js 15 OAuth implementation best practices"` (framework)
4. `"OAuth token refresh security 2024"` (current practices)

**Expected Sources** (ranked):
- RFC 7636 (IETF standard) - Score: 5.0
- Supabase Auth documentation - Score: 4.8
- Next.js authentication patterns - Score: 4.5
- Auth0 OAuth guide - Score: 4.2

**PRISMA Flow**:
```
Identified: 150 results (across 4 queries)
Screened: 50 (title/abstract review)
Fetched: 20 (full text)
Scored: 20 (CRAAP rubric)
Included: 8 (score ≥3.2)
```

**Time Estimate**: 15-20 minutes

### Domain-Limited Searches

When broad searches fail, use domain-limited fallbacks:

```bash
site:ietf.org "OAuth 2.0"
site:w3.org "WCAG 2.1"
site:docs.microsoft.com "Next.js"
site:github.com "supabase nextjs auth"
site:vercel.com "performance optimization"
```

### Stopping Criteria

**Stop searching when**:
- Found ≥5 high-quality sources (score ≥4.0)
- 3 query expansions yield no new high-quality sources
- Time limit reached (20 minutes for most tasks)
- Coverage gaps documented for user decision

**Continue searching when**:
- <3 high-quality sources found
- Critical gap in coverage (e.g., missing security considerations)
- User explicitly requests exhaustive search
