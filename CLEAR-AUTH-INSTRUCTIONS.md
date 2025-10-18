# Clear Authentication Session - Instructions

## The Problem
You're seeing: `Invalid Refresh Token: Refresh Token Not Found`

This happens when there's a stale or invalid session cookie in your browser from a previous session.

## Quick Fix (Choose One)

### Option 1: Clear Cookies in DevTools (Recommended)
1. Open the login page: http://localhost:3000/login
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Find **Cookies** in the left sidebar
5. Expand **http://localhost:3000**
6. Delete all cookies that start with:
   - `sb-`
   - Any Supabase-related cookies
7. Refresh the page (Cmd+R or F5)

### Option 2: Use Incognito/Private Window
1. Open a new Incognito/Private browsing window
2. Visit: http://localhost:3000/login
3. The error should be gone (no cookies to conflict)

### Option 3: Clear All Site Data
1. Open DevTools (F12)
2. Go to **Application** > **Storage**
3. Click **Clear site data** button
4. Refresh the page

## What Was Fixed

The codebase now includes automatic error handling:

### 1. Enhanced Supabase Client (`lib/supabase-client.ts`)
- Added `autoRefreshToken: true` to automatically refresh tokens
- Added `onAuthStateChange` listener to detect auth events
- Will gracefully handle token refresh failures

### 2. Login Page (`app/login/page.tsx`)
- Catches refresh token errors on page load
- Automatically calls `signOut()` to clear invalid sessions
- User can proceed with fresh login

### 3. Dashboard Page (`app/dashboard/page.tsx`)
- Detects invalid refresh tokens when fetching user
- Clears session and redirects to login
- Prevents app crashes from stale auth state

## Testing Steps

After clearing cookies:

1. **Visit Login Page**
   ```
   http://localhost:3000/login
   ```
   - Should load without errors
   - No console errors about refresh tokens

2. **Try to Sign Up**
   ```
   http://localhost:3000/signup
   ```
   - Enter email and password
   - Should create account successfully

3. **Test Login**
   - Enter credentials
   - Should redirect to dashboard
   - Dashboard should load without errors

4. **Test Protected Routes**
   - Visit `/dashboard` without login
   - Should redirect to `/login`

## Why This Happened

Common causes:
1. **Development restart** - Supabase project was restarted or keys changed
2. **Database reset** - User table was cleared but cookies remained
3. **Environment change** - Switched between different Supabase projects
4. **Expired session** - Token expired but browser didn't clear it

## Prevention

The fixes added will now:
- ✅ Automatically detect invalid tokens
- ✅ Clear corrupt sessions
- ✅ Redirect users to login gracefully
- ✅ Log auth events for debugging

## If Error Persists

If you still see the error after clearing cookies:

1. Check Supabase environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Verify Supabase project is active:
   - Visit https://supabase.com/dashboard
   - Check project status

3. Restart dev server:
   ```bash
   # Kill all dev servers
   pkill -f "next dev"
   
   # Start fresh
   cd "/Users/chudinnorukam/Downloads/Repurpose MVP "
   npm run dev
   ```

4. Check browser console for additional errors

---

**Next Step**: Clear your browser cookies and refresh the login page!
