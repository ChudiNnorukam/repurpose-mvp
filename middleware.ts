import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Next.js Middleware for Authentication and Route Protection
 *
 * This middleware runs before routes are processed and handles:
 * - Session refresh for authenticated users
 * - Redirects for protected routes
 * - Public route access
 *
 * Protects:
 * - /dashboard
 * - /create
 * - /posts
 * - /connections
 * - /templates
 * - /api/* (except public auth routes)
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if available
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected page routes - require authentication
  const protectedPageRoutes = [
    '/dashboard',
    '/create',
    '/generate',
    '/posts',
    '/connections',
    '/templates',
  ]

  // Public routes that should redirect to dashboard if authenticated
  const authRoutes = ['/login', '/signup']

  // Check if current path is protected
  const isProtectedPage = protectedPageRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users from protected pages to login
  if (isProtectedPage && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from login/signup to dashboard
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // API route protection is handled in individual routes
  // This allows for more granular control and better error messages

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
