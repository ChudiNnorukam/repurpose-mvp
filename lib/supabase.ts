import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
// This should only be called on the server side
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. This function should only be called on the server.')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (we'll expand this as we create tables)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'instagram'
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          account_username: string
          account_id: string
          connected_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'instagram'
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          account_username: string
          account_id?: string
          connected_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'twitter' | 'linkedin' | 'instagram'
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          account_username?: string
          account_id?: string
          connected_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          original_content: string
          platform: 'twitter' | 'linkedin' | 'instagram'
          adapted_content: string
          scheduled_time: string | null
          status: 'draft' | 'scheduled' | 'posted' | 'failed'
          posted_at: string | null
          error_message: string | null
          qstash_message_id: string | null
          platform_post_id: string | null
          post_url: string | null
          tone: string | null
          is_draft: boolean
          parent_post_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_content: string
          platform: 'twitter' | 'linkedin' | 'instagram'
          adapted_content: string
          scheduled_time?: string | null
          status?: 'draft' | 'scheduled' | 'posted' | 'failed'
          posted_at?: string | null
          error_message?: string | null
          qstash_message_id?: string | null
          platform_post_id?: string | null
          post_url?: string | null
          tone?: string | null
          is_draft?: boolean
          parent_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_content?: string
          platform?: 'twitter' | 'linkedin' | 'instagram'
          adapted_content?: string
          scheduled_time?: string | null
          status?: 'draft' | 'scheduled' | 'posted' | 'failed'
          posted_at?: string | null
          error_message?: string | null
          qstash_message_id?: string | null
          platform_post_id?: string | null
          post_url?: string | null
          tone?: string | null
          is_draft?: boolean
          parent_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
