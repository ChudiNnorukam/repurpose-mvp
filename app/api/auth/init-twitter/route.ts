/**
 * DEPRECATED: This endpoint is deprecated.
 * Use /api/auth/twitter/init instead.
 *
 * This file exists only for backward compatibility and will be removed.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint. Use /api/auth/twitter/init (GET) instead.',
      correct_endpoint: '/api/auth/twitter/init',
      method: 'GET'
    },
    { status: 410 } // 410 Gone
  )
}

export async function GET(request: NextRequest) {
  // Redirect GET requests to the correct endpoint
  return NextResponse.redirect(
    new URL('/api/auth/twitter/init', request.url),
    { status: 301 } // Permanent redirect
  )
}
