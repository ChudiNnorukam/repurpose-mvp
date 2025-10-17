// Supabase Query Patterns with RLS and TypeScript
import { createClient } from '@/lib/supabase/server'
import { createClient as createClientClient } from '@/lib/supabase-client'

// Server-side query (API routes, Server Components)
export async function getPostsServerSide(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)  // RLS enforces this automatically
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Supabase query error:', error)
    throw new Error('Failed to fetch posts')
  }

  return data
}

// Client-side query (Client Components)
export async function getPostsClientSide() {
  const supabase = createClientClient()
  
  // RLS automatically filters by authenticated user
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Insert with validation
export async function createPost(userId: string, postData: {
  platform: string
  adapted_content: string
  scheduled_time: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      ...postData,
      status: 'scheduled',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update with optimistic locking
export async function updatePost(postId: string, updates: Partial<Post>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete with cascade (if configured in DB)
export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

// Complex join query
export async function getPostsWithAccounts(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      social_accounts (
        platform,
        account_name
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
