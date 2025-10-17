// API Integration Test Template for Repurpose MVP
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Test Configuration
const TEST_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  testUserId: 'test-user-integration'
}

// Supabase Admin Client
const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey)

// Helper: Create test user session
let testUserToken: string

beforeAll(async () => {
  // Create test user
  const { data: authData, error } = await supabase.auth.admin.createUser({
    email: 'integration-test@example.com',
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: { name: 'Integration Test User' }
  })

  if (error) throw error

  // Get session token
  const { data: sessionData } = await supabase.auth.signInWithPassword({
    email: 'integration-test@example.com',
    password: 'TestPassword123!'
  })

  testUserToken = sessionData.session!.access_token
})

afterAll(async () => {
  // Cleanup test data
  await supabase.from('posts').delete().eq('user_id', TEST_CONFIG.testUserId)
  await supabase.auth.admin.deleteUser(TEST_CONFIG.testUserId)
})

// Example 1: Content Adaptation API
describe('POST /api/adapt', () => {
  it('should adapt content for multiple platforms', async () => {
    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/adapt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        content: 'Check out our new product launch!',
        platforms: ['twitter', 'linkedin'],
        tone: 'professional'
      })
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    
    expect(data).toHaveProperty('adaptedContent')
    expect(data.adaptedContent).toHaveProperty('twitter')
    expect(data.adaptedContent).toHaveProperty('linkedin')
    
    // Verify Twitter content is within limits
    expect(data.adaptedContent.twitter.length).toBeLessThanOrEqual(280)
    
    // Verify LinkedIn content exists
    expect(data.adaptedContent.linkedin.length).toBeGreaterThan(0)
  })

  it('should return 401 without authentication', async () => {
    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Test',
        platforms: ['twitter'],
        tone: 'casual'
      })
    })

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid platform', async () => {
    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/adapt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        content: 'Test content',
        platforms: ['invalid-platform'],
        tone: 'professional'
      })
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain('Invalid platform')
  })

  it('should enforce rate limiting', async () => {
    // Make 11 requests (limit is 10/hour)
    const requests = Array.from({ length: 11 }, () =>
      fetch(`${TEST_CONFIG.apiUrl}/api/adapt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({
          content: 'Rate limit test',
          platforms: ['twitter'],
          tone: 'casual'
        })
      })
    )

    const responses = await Promise.all(requests)
    
    // Last request should be rate limited
    const lastResponse = responses[10]
    expect(lastResponse.status).toBe(429)
    
    const data = await lastResponse.json()
    expect(data.error).toContain('Rate limit')
    expect(data).toHaveProperty('reset')
  })
})

// Example 2: Post Scheduling API
describe('POST /api/schedule', () => {
  let postId: string

  it('should schedule post for future time', async () => {
    const scheduledTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        platform: 'twitter',
        content: 'Scheduled post test',
        scheduledTime: scheduledTime.toISOString()
      })
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    
    expect(data.success).toBe(true)
    expect(data).toHaveProperty('postId')
    expect(data).toHaveProperty('messageId') // QStash message ID
    
    postId = data.postId

    // Verify post in database
    const { data: post } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    expect(post).toBeDefined()
    expect(post.status).toBe('scheduled')
    expect(post.qstash_message_id).toBeTruthy()
  })

  it('should reject past scheduled times', async () => {
    const pastTime = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago

    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        platform: 'twitter',
        content: 'Test',
        scheduledTime: pastTime.toISOString()
      })
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain('future')
  })

  it('should allow canceling scheduled post', async () => {
    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/posts/${postId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    })

    expect(response.status).toBe(200)

    // Verify status updated
    const { data: post } = await supabase
      .from('posts')
      .select('status')
      .eq('id', postId)
      .single()

    expect(post.status).toBe('cancelled')
  })
})

// Example 3: Posts Listing API
describe('GET /api/posts', () => {
  beforeEach(async () => {
    // Create test posts
    await supabase.from('posts').insert([
      {
        user_id: TEST_CONFIG.testUserId,
        platform: 'twitter',
        adapted_content: 'Post 1',
        status: 'scheduled',
        scheduled_time: new Date().toISOString()
      },
      {
        user_id: TEST_CONFIG.testUserId,
        platform: 'linkedin',
        adapted_content: 'Post 2',
        status: 'posted',
        posted_at: new Date().toISOString()
      }
    ])
  })

  it('should return user posts', async () => {
    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/posts`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    
    expect(Array.isArray(data.posts)).toBe(true)
    expect(data.posts.length).toBeGreaterThanOrEqual(2)
    
    // Verify posts belong to user
    data.posts.forEach((post: any) => {
      expect(post.user_id).toBe(TEST_CONFIG.testUserId)
    })
  })

  it('should filter by status', async () => {
    const response = await fetch(
      `${TEST_CONFIG.apiUrl}/api/posts?status=scheduled`,
      {
        headers: {
          'Authorization': `Bearer ${testUserToken}`
        }
      }
    )

    expect(response.status).toBe(200)

    const data = await response.json()
    
    data.posts.forEach((post: any) => {
      expect(post.status).toBe('scheduled')
    })
  })

  it('should filter by platform', async () => {
    const response = await fetch(
      `${TEST_CONFIG.apiUrl}/api/posts?platform=twitter`,
      {
        headers: {
          'Authorization': `Bearer ${testUserToken}`
        }
      }
    )

    expect(response.status).toBe(200)

    const data = await response.json()
    
    data.posts.forEach((post: any) => {
      expect(post.platform).toBe('twitter')
    })
  })
})

// Example 4: OAuth Callback API
describe('GET /api/auth/twitter/callback', () => {
  it('should exchange code for tokens', async () => {
    // This test would require mocking Twitter's OAuth response
    // or using a test Twitter app with sandbox credentials
    
    const mockCode = 'test_authorization_code'
    const mockState = 'test_state_token'

    // In real test, you'd mock the Twitter API
    const response = await fetch(
      `${TEST_CONFIG.apiUrl}/api/auth/twitter/callback?code=${mockCode}&state=${mockState}`,
      {
        headers: {
          'Cookie': `oauth_state=${mockState}` // State stored in cookie
        },
        redirect: 'manual'
      }
    )

    // Should redirect to connections page
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('/connections')
  })

  it('should reject invalid state parameter', async () => {
    const response = await fetch(
      `${TEST_CONFIG.apiUrl}/api/auth/twitter/callback?code=test&state=invalid`,
      {
        redirect: 'manual'
      }
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('error=invalid_state')
  })
})

// Example 5: Batch Generation API
describe('POST /api/batch/generate', () => {
  it('should generate multiple topics from theme', async () => {
    const response = await fetch(`${TEST_CONFIG.apiUrl}/api/batch/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        theme: 'Social media marketing',
        count: 30
      })
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    
    expect(Array.isArray(data.topics)).toBe(true)
    expect(data.topics.length).toBe(30)
    
    // Verify topics are related to theme
    data.topics.forEach((topic: string) => {
      expect(topic.length).toBeGreaterThan(0)
    })
  }, 30000) // 30 second timeout for AI generation
})

// Repurpose-Specific Integration Test Patterns
export const RepurposeIntegrationPatterns = {
  // Pattern 1: Authenticated request helper
  authenticatedRequest: async (path: string, options: RequestInit = {}) => {
    return fetch(`${TEST_CONFIG.apiUrl}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${testUserToken}`
      }
    })
  },

  // Pattern 2: Create test post
  createTestPost: async (userId: string, overrides = {}) => {
    const { data } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        platform: 'twitter',
        adapted_content: 'Test post',
        status: 'draft',
        ...overrides
      })
      .select()
      .single()

    return data
  },

  // Pattern 3: Cleanup test data
  cleanupTestData: async (userId: string) => {
    await supabase.from('posts').delete().eq('user_id', userId)
    await supabase.from('social_accounts').delete().eq('user_id', userId)
  }
}
