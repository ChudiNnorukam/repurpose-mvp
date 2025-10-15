import { NextRequest, NextResponse } from 'next/server'
import { getLinkedInAuthUrl } from '@/lib/linkedin'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: NextRequest) {
  try {
    console.log('[init-linkedin] Request received')
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[init-linkedin] Unauthorized request', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('[init-linkedin] Processing for userId:', userId)
    // codex_agent: Require an authenticated Supabase session before continuing.

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex')

    // Store state and userId together
    // codex_agent: Persist the authenticated user alongside the state payload for later validation.
    const stateData = JSON.stringify({ state, userId })
    const encodedState = Buffer.from(stateData).toString('base64url')

    // Get LinkedIn authorization URL
    const authUrl = getLinkedInAuthUrl(encodedState)

    console.log('[init-linkedin] Success, returning authUrl')
    return NextResponse.json({ authUrl, state: encodedState })
  } catch (error) {
    console.error('[init-linkedin] Error initiating LinkedIn OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn OAuth' },
      { status: 500 }
    )
  }
}
