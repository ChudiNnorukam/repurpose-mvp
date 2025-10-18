import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Validate environment variables exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Automatically handle invalid refresh tokens
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  // Listen for auth errors and clear invalid sessions
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      // Session was cleared or refreshed
      console.log(`Auth event: ${event}`)
    }
  })

  return client
}

// Singleton instance for client-side use
export const supabase = createClient()
