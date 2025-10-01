import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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
          account_username: string
          connected_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'instagram'
          access_token: string
          account_username: string
          connected_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'twitter' | 'linkedin' | 'instagram'
          access_token?: string
          account_username?: string
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
          created_at: string
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
          created_at?: string
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
          created_at?: string
        }
      }
    }
  }
}
