# Codex Agent Log

## 2024-??-?? LinkedIn REST migration
- Observed: Legacy LinkedIn `/v2/ugcPosts` endpoint used in `lib/linkedin.ts`; caller in `app/api/post/execute/route.ts` expected ID string.
- Decide: Migrate to `/rest/posts` with new payload schema and propagate URN handling to caller while improving error reporting.
- Act: Updated LinkedIn post helper to call `/rest/posts` with REST payload, parse returned URN, and surface structured errors; adjusted post executor to capture URN and surface it in responses.
- Verify: `npm run lint` (fails due to pre-existing repo lint violations unrelated to this change).
- Reflect: Future work—store the LinkedIn URN in the database once schema supports it and address repo-wide lint issues.
