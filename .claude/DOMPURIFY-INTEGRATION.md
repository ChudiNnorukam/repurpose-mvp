# DOMPurify Integration Guide - XSS Prevention

**Version**: 1.0  
**Purpose**: Prevent XSS attacks when rendering user-generated HTML  
**OWASP Reference**: [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

## When Do You Need DOMPurify?

**Use DOMPurify when**:
- Rendering user-generated HTML (e.g., rich text editor content, AI-generated HTML)
- Using `dangerouslySetInnerHTML` in React
- Displaying content from third-party APIs that may contain HTML

**Don't need DOMPurify when**:
- Rendering plain text (React escapes by default)
- Using controlled components (input, textarea with value prop)
- Displaying data as JSON/numbers

---

## Installation

```bash
npm install isomorphic-dompurify
```

**Why `isomorphic-dompurify`?** Works in both browser and SSR (Next.js server components).

---

## Basic Usage Pattern

### 1. Safe HTML Rendering Component

```typescript
// components/SafeHTML.tsx
import DOMPurify from 'isomorphic-dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  allowedTags?: string[];
}

export function SafeHTML({ html, className, allowedTags }: SafeHTMLProps) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags || ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
```

**Usage**:
```tsx
// AI-generated content (repurpose use case)
<SafeHTML html={adaptedContent} className="prose" />

// User bio (allow links)
<SafeHTML 
  html={user.bio} 
  allowedTags={['p', 'a', 'br']} 
  className="text-sm"
/>
```

---

## Integration Points in Repurpose MVP

### 1. AI-Generated Content Display

**File**: `components/posts/PostCard.tsx`, `app/posts/[id]/page.tsx`

**Before** (VULNERABLE):
```tsx
// ❌ XSS risk: AI could inject <script>
<div dangerouslySetInnerHTML={{ __html: post.adapted_content }} />
```

**After** (SAFE):
```tsx
import { SafeHTML } from '@/components/SafeHTML';

// ✅ Sanitized
<SafeHTML 
  html={post.adapted_content} 
  allowedTags={['p', 'br', 'strong', 'em', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li']}
  className="prose prose-sm"
/>
```

### 2. User-Generated Bios/Descriptions

**File**: `components/profile/UserBio.tsx`

```tsx
// ❌ Before
<p>{user.bio}</p>  // Safe if plain text, but what if user adds HTML?

// ✅ After
<SafeHTML 
  html={user.bio} 
  allowedTags={['p', 'a', 'br', 'strong', 'em']}
  className="text-gray-700"
/>
```

### 3. Third-Party API Content (Twitter, LinkedIn)

**File**: `lib/twitter.ts`, `lib/linkedin.ts`

```tsx
// When displaying tweets/posts from social platforms
import DOMPurify from 'isomorphic-dompurify';

async function fetchTweet(id: string) {
  const tweet = await twitter.get(`/tweets/${id}`);
  
  // Sanitize before storing/displaying
  return {
    ...tweet,
    text: DOMPurify.sanitize(tweet.text, {
      ALLOWED_TAGS: ['a'],  // Twitter embeds may have links
      ALLOWED_ATTR: ['href'],
    }),
  };
}
```

---

## Configuration Profiles

### Strict (Default) - For User Input

```typescript
const strictConfig = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

DOMPurify.sanitize(userInput, strictConfig);
```

### Moderate - For AI-Generated Content

```typescript
const moderateConfig = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote'],
  ALLOWED_ATTR: ['href', 'title', 'class'],  // Allow Tailwind classes
  ALLOW_DATA_ATTR: false,
};

DOMPurify.sanitize(aiGeneratedHTML, moderateConfig);
```

### Permissive - For Trusted Admin Content

```typescript
const permissiveConfig = {
  ALLOWED_TAGS: DOMPurify.DEFAULT_ALLOWED_TAGS,  // Most HTML tags
  ALLOWED_ATTR: DOMPurify.DEFAULT_ALLOWED_ATTR,
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],  // Still block dangerous tags
};

DOMPurify.sanitize(adminContent, permissiveConfig);
```

---

## Security Checklist

Before merging any code that renders HTML:

- [ ] **All `dangerouslySetInnerHTML` uses `DOMPurify.sanitize()`**
  ```bash
  # Check for unsafe usage
  grep -rn "dangerouslySetInnerHTML" --include="*.tsx" app/ components/ | grep -v "SafeHTML"
  ```

- [ ] **Appropriate config for content type**
  - User input → strict
  - AI-generated → moderate
  - Admin/trusted → permissive (still sanitize!)

- [ ] **No inline event handlers allowed**
  ```typescript
  // Verify config blocks onclick, onerror, etc.
  ALLOWED_ATTR: ['href', 'title'],  // No 'onclick', 'onerror'
  ```

- [ ] **Links open safely**
  ```typescript
  // For user/AI content, force target="_blank" and rel="noopener noreferrer"
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  ```

- [ ] **Test with XSS payloads** (see below)

---

## Testing for XSS

### Test Payloads (Benign, for Testing Only)

```typescript
// components/__tests__/SafeHTML.test.tsx
import { render } from '@testing-library/react';
import { SafeHTML } from '../SafeHTML';

describe('SafeHTML XSS Prevention', () => {
  it('blocks script tags', () => {
    const xss = '<p>Hello</p><script>alert("XSS")</script>';
    const { container } = render(<SafeHTML html={xss} />);
    
    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).toContain('<p>Hello</p>');
  });

  it('blocks onclick handlers', () => {
    const xss = '<a href="#" onclick="alert(\'XSS\')">Click me</a>';
    const { container } = render(<SafeHTML html={xss} />);
    
    expect(container.innerHTML).not.toContain('onclick');
  });

  it('sanitizes data URLs', () => {
    const xss = '<a href="javascript:alert(\'XSS\')">Click</a>';
    const { container } = render(<SafeHTML html={xss} />);
    
    // DOMPurify should remove javascript: protocol
    expect(container.innerHTML).not.toContain('javascript:');
  });

  it('allows safe HTML', () => {
    const safe = '<p>Safe <strong>content</strong> with <a href="https://example.com">link</a></p>';
    const { container } = render(<SafeHTML html={safe} />);
    
    expect(container.innerHTML).toContain('<strong>content</strong>');
    expect(container.innerHTML).toContain('href="https://example.com"');
  });
});
```

### Manual Testing (Browser Console)

```javascript
// Test in browser console on staging
const testPayloads = [
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '<iframe src="javascript:alert(\'XSS\')">',
  '<a href="javascript:alert(\'XSS\')">Click</a>',
];

testPayloads.forEach(payload => {
  const sanitized = DOMPurify.sanitize(payload);
  console.log(`Input: ${payload}`);
  console.log(`Output: ${sanitized}`);
  console.log('---');
});

// Expected: All should output empty or safe HTML (no scripts/handlers)
```

---

## CI/CD Integration

**File**: `.github/workflows/security-validation-tuned.yml`

```yaml
- name: Check for unsafe dangerouslySetInnerHTML
  run: |
    if grep -rn "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx" app/ components/ 2>/dev/null; then
      echo "::warning::Found dangerouslySetInnerHTML - verify DOMPurify is used"
      
      # Fail if used without SafeHTML wrapper or sanitize call
      if grep -rn "dangerouslySetInnerHTML" --include="*.tsx" app/ components/ | grep -v "SafeHTML" | grep -v "sanitize"; then
        echo "::error::Unsafe dangerouslySetInnerHTML detected - must use DOMPurify.sanitize()"
        exit 1
      fi
    fi
```

---

## Performance Considerations

**DOMPurify is fast** (~1ms for typical content), but optimize for repeated renders:

```typescript
// ❌ Slow: Sanitizes on every render
function PostCard({ post }) {
  return <SafeHTML html={DOMPurify.sanitize(post.content)} />;  // Re-sanitizes every render!
}

// ✅ Fast: Sanitize once, memoize
import { useMemo } from 'react';

function PostCard({ post }) {
  const sanitized = useMemo(
    () => DOMPurify.sanitize(post.content),
    [post.content]
  );
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

**Or sanitize server-side** (best for Repurpose):

```typescript
// app/api/adapt/route.ts
import DOMPurify from 'isomorphic-dompurify';

export async function POST(request: Request) {
  const adaptedContent = await anthropic.generateContent(...);
  
  // Sanitize before storing in DB
  const sanitized = DOMPurify.sanitize(adaptedContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'h1', 'h2', 'h3'],
  });
  
  await supabase.from('posts').insert({
    adapted_content: sanitized,  // Store sanitized content
  });
}
```

---

## Common Mistakes & Fixes

### Mistake 1: Sanitizing After Render

```tsx
// ❌ XSS: Rendered before sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />
{DOMPurify.sanitize(userInput)}  // Too late!

// ✅ Sanitize before render
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Mistake 2: Over-Permissive Config

```tsx
// ❌ Allows all attributes (including onclick, onerror)
DOMPurify.sanitize(html, { ALLOWED_ATTR: DOMPurify.DEFAULT_ALLOWED_ATTR });

// ✅ Explicit whitelist
DOMPurify.sanitize(html, { ALLOWED_ATTR: ['href', 'title', 'class'] });
```

### Mistake 3: Trusting "Safe" Sources

```tsx
// ❌ Assumption: LinkedIn API is safe
<div dangerouslySetInnerHTML={{ __html: linkedInPost.content }} />

// ✅ Always sanitize third-party content
<SafeHTML html={linkedInPost.content} />
```

---

## Migration Plan

### Phase 1: Audit (Week 1)

```bash
# Find all dangerouslySetInnerHTML usage
grep -rn "dangerouslySetInnerHTML" --include="*.tsx" app/ components/

# Expected locations in Repurpose:
# - components/posts/PostCard.tsx (AI content)
# - app/posts/[id]/page.tsx (post detail)
# - components/profile/UserBio.tsx (if exists)
```

### Phase 2: Implement SafeHTML (Week 2)

1. Create `components/SafeHTML.tsx` (see above)
2. Add tests `components/__tests__/SafeHTML.test.tsx`
3. Install `npm install isomorphic-dompurify`

### Phase 3: Replace Unsafe Usage (Week 2-3)

1. Replace `dangerouslySetInnerHTML` with `<SafeHTML>`
2. Choose appropriate config (strict/moderate/permissive)
3. Test with XSS payloads

### Phase 4: Enforce in CI (Week 3)

1. Add check to `.github/workflows/security-validation-tuned.yml`
2. Fail build on unsafe `dangerouslySetInnerHTML` without `sanitize`

---

## References

- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **DOMPurify Docs**: https://github.com/cure53/DOMPurify
- **React Security**: https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html
- **OWASP A03:2021 Injection**: https://owasp.org/Top10/A03_2021-Injection/

---

**Next Steps**:
1. Run audit: `grep -rn "dangerouslySetInnerHTML"`
2. Install: `npm install isomorphic-dompurify`
3. Create `SafeHTML.tsx` component
4. Replace unsafe usage in PostCard, post detail pages
5. Add CI check to security workflow
