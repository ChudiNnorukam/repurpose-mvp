// Next.js 15 API Route Template with Auth + Rate Limiting
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ErrorResponses } from '@/lib/api/errors'
import { checkRateLimit, apiRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return ErrorResponses.unauthorized()
    }

    // 2. Rate Limiting
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Try again after ${new Date(rateLimitResult.reset).toLocaleTimeString()}.`,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset
        },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // 3. Parse and validate input
    const body = await request.json()
    const { field1, field2 } = body

    if (!field1) {
      return ErrorResponses.missingField('field1')
    }

    // 4. Business logic
    // ... your implementation here ...

    // 5. Success response
    return NextResponse.json({
      success: true,
      data: { /* your data */ }
    })
  } catch (error: any) {
    console.error('Error in /api/endpoint:', error)
    return ErrorResponses.internalError(error.message)
  }
}
