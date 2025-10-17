# Enhanced Error Logging - Generate Page

**Deployment**: ✅ Live at https://repurpose-orpin.vercel.app/generate
**Commit**: `7c645ef` - Enhanced error logging with detailed Supabase error information
**Date**: October 16, 2025

## What's New

I've deployed a new version with **enhanced error logging** that will capture the complete Supabase error details when the accounts fail to load.

## Changes Made

### Updated Error Logging (lines 76-84)

```typescript
console.log('[DEBUG] Query result - accounts:', accounts?.length || 0, 'error:', error)
console.log('[DEBUG] Full error object:', JSON.stringify(error, null, 2))  // NEW

if (error) {
  console.error('[ERROR] Error loading accounts:', error)
  console.error('[ERROR] Error code:', error.code)          // NEW
  console.error('[ERROR] Error message:', error.message)    // NEW
  console.error('[ERROR] Error details:', error.details)    // NEW
  console.error('[ERROR] Error hint:', error.hint)          // NEW
  toast.error('Could not load connected accounts')
  setConnectedAccounts([])
  return
}
```

## How to Check Console Logs

1. **Open the Generate page**: https://repurpose-orpin.vercel.app/generate

2. **Open Browser Console**:
   - **Chrome/Edge**: Press `Cmd + Option + J` (Mac) or `Ctrl + Shift + J` (Windows)
   - **Firefox**: Press `Cmd + Option + K` (Mac) or `Ctrl + Shift + K` (Windows)
   - Or right-click → "Inspect" → "Console" tab

3. **Refresh the page** to see the new debug logs

4. **Look for these NEW logs**:
   ```
   [DEBUG] Full error object: {
     "code": "...",
     "message": "...",
     "details": "...",
     "hint": "..."
   }
   [ERROR] Error code: ...
   [ERROR] Error message: ...
   [ERROR] Error details: ...
   [ERROR] Error hint: ...
   ```

## What the Error Will Tell Us

### Possible Error Codes:

1. **`42501` or `PGRST301`** = RLS Policy Error
   - **Meaning**: Row Level Security policy is blocking the query
   - **Fix**: Update RLS policies to allow SELECT for authenticated users

2. **`PGRST300`** = JWT Token Error
   - **Meaning**: JWT/session token is invalid or expired
   - **Fix**: Check cookie configuration in Supabase client

3. **`22P02`** = Invalid Input Syntax
   - **Meaning**: Query parameter is malformed (unlikely in this case)
   - **Fix**: Check user_id format

4. **Other codes** = Various database/auth issues
   - **Details will be in**: `error.message`, `error.details`, `error.hint`

## Next Steps Based on Error

Once you provide the **full error details** from the console:

- **If RLS Error**: I'll update the `social_accounts` table RLS policies
- **If JWT Error**: I'll fix the Supabase client cookie configuration
- **If Other**: I'll investigate based on the specific error code and message

## Current State

- ✅ User authentication working (user ID: `332b63c1-b1f7-4a07-9eba-6817ce3803ac`)
- ✅ Query syntax correct (same as Connections page)
- ❌ Supabase query returns **400 Bad Request**
- ❓ **Need error details to identify root cause**

## Expected Outcome

After reviewing the enhanced error logs, we'll know EXACTLY why the query is failing:
- Error code will identify the category (RLS, JWT, syntax, etc.)
- Error message will describe the issue
- Error hint will suggest the fix (if available)
