/**
 * Shared type definitions for the Repurpose application
 */

/**
 * Supported social media platforms
 */
export type Platform = 'twitter' | 'linkedin' | 'instagram'

/**
 * Content tone options for AI adaptation
 */
export type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'

/**
 * Post status in the workflow
 */
export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed'

/**
 * Adapted content for a specific platform
 */
export interface AdaptedContent {
  platform: Platform
  content: string
  characterCount?: number
}

/**
 * Post record from database
 */
export interface Post {
  id: string
  user_id: string
  original_content: string
  platform: Platform
  adapted_content: string
  scheduled_time: string | null
  status: PostStatus
  posted_at: string | null
  error_message: string | null
  qstash_message_id: string | null
  created_at: string
}

/**
 * Social account connection
 */
export interface SocialAccount {
  id: string
  user_id: string
  platform: Platform
  access_token: string
  refresh_token: string | null
  expires_at: string | null
  account_username: string
  account_id: string
  connected_at: string
}

/**
 * QStash job data for scheduling posts
 */
export interface SchedulePostJob {
  postId: string
  platform: Platform
  content: string
  userId: string
}
