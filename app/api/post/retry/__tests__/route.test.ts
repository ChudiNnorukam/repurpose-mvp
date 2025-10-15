jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')

  return {
    ...actual,
    NextResponse: {
      json: (body: unknown, init?: ResponseInit) => {
        const headers = new Headers(init?.headers ?? {})

        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json')
        }

        return {
          status: init?.status ?? 200,
          headers,
          json: async () => body,
        }
      },
    },
  }
})

import { POST } from '../route'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { schedulePostJob } from '@/lib/qstash'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn(),
}))

jest.mock('@/lib/qstash', () => ({
  schedulePostJob: jest.fn(),
}))

const mockAuthGetUser = jest.fn()
const mockSingle = jest.fn()
const mockEq = jest.fn()
const mockSelect = jest.fn()
const mockFrom = jest.fn()

const mockAdminEq = jest.fn()
const mockAdminUpdate = jest.fn()
const mockAdminFrom = jest.fn()

const supabaseClient = {
  auth: {
    getUser: mockAuthGetUser,
  },
  from: mockFrom,
} as any

const supabaseAdminClient = {
  from: mockAdminFrom,
} as any

;(createClient as jest.Mock).mockResolvedValue(supabaseClient)
;(getSupabaseAdmin as jest.Mock).mockReturnValue(supabaseAdminClient)

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  jest.clearAllMocks()

  mockAuthGetUser.mockResolvedValue({
    data: { user: { id: 'user-123' } },
    error: null,
  })

  mockSingle.mockReset()
  mockEq.mockReset()
  mockSelect.mockReset()
  mockFrom.mockReset()

  mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })
  mockEq.mockImplementation(() => ({ single: mockSingle }))
  mockSelect.mockImplementation(() => ({ eq: mockEq }))
  mockFrom.mockImplementation(() => ({ select: mockSelect }))

  mockAdminEq.mockReset()
  mockAdminUpdate.mockReset()
  mockAdminFrom.mockReset()

  mockAdminEq.mockResolvedValue({ error: null })
  mockAdminUpdate.mockImplementation(() => ({ eq: mockAdminEq }))
  mockAdminFrom.mockImplementation(() => ({ update: mockAdminUpdate }))

  ;(schedulePostJob as jest.Mock).mockReset()
  ;(schedulePostJob as jest.Mock).mockResolvedValue(undefined)
})

afterAll(() => {
  consoleErrorSpy.mockRestore()
})

describe('POST /api/post/retry', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const request = {
      json: jest.fn().mockResolvedValue({ postId: 'post-1' }),
    } as any

    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(getSupabaseAdmin).not.toHaveBeenCalled()
  })

  it('returns 400 when postId is missing', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({}),
    } as any

    const response = await POST(request)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Post ID required' })
    expect(getSupabaseAdmin).not.toHaveBeenCalled()
  })

  it('returns 404 when post cannot be found', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'No rows' } })

    const request = {
      json: jest.fn().mockResolvedValue({ postId: 'post-404' }),
    } as any

    const response = await POST(request)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Post not found' })
    expect(getSupabaseAdmin).not.toHaveBeenCalled()
  })

  it('returns 403 when post belongs to a different user', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'post-2',
        user_id: 'another-user',
        status: 'failed',
        scheduled_time: new Date().toISOString(),
        platform: 'twitter',
        adapted_content: 'content',
      },
      error: null,
    })

    const request = {
      json: jest.fn().mockResolvedValue({ postId: 'post-2' }),
    } as any

    const response = await POST(request)

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: 'You do not have permission to retry this post',
    })
    expect(getSupabaseAdmin).not.toHaveBeenCalled()
  })

  it('returns 400 when the post is not failed', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'post-3',
        user_id: 'user-123',
        status: 'scheduled',
        scheduled_time: new Date().toISOString(),
        platform: 'twitter',
        adapted_content: 'content',
      },
      error: null,
    })

    const request = {
      json: jest.fn().mockResolvedValue({ postId: 'post-3' }),
    } as any

    const response = await POST(request)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Can only retry failed posts' })
  })

  it('returns 500 when updating the post fails', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'post-4',
        user_id: 'user-123',
        status: 'failed',
        scheduled_time: new Date(Date.now() + 60_000).toISOString(),
        platform: 'twitter',
        adapted_content: 'content',
      },
      error: null,
    })

    mockAdminEq.mockResolvedValueOnce({ error: { message: 'update failed' } })

    const request = {
      json: jest.fn().mockResolvedValue({ postId: 'post-4' }),
    } as any

    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to retry post' })
    expect(schedulePostJob).not.toHaveBeenCalled()
  })

  it('schedules the retry when everything succeeds', async () => {
    const scheduledTime = new Date(Date.now() + 60_000).toISOString()

    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'post-5',
        user_id: 'user-123',
        status: 'failed',
        scheduled_time: scheduledTime,
        platform: 'twitter',
        adapted_content: 'content',
      },
      error: null,
    })

    const request = {
      json: jest.fn().mockResolvedValue({ postId: 'post-5' }),
    } as any

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      success: true,
      message: 'Post retry scheduled',
    })
    expect(schedulePostJob).toHaveBeenCalledWith(
      {
        postId: 'post-5',
        platform: 'twitter',
        content: 'content',
        userId: 'user-123',
      },
      expect.any(Date)
    )
  })

  it('rolls back status when scheduling fails', async () => {
    const scheduledTime = new Date(Date.now() + 60_000).toISOString()

    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'post-6',
        user_id: 'user-123',
        status: 'failed',
        scheduled_time: scheduledTime,
        platform: 'twitter',
        adapted_content: 'content',
      },
      error: null,
    })

    mockAdminEq
      .mockResolvedValueOnce({ error: null }) // initial update
      .mockResolvedValueOnce({ error: null }) // rollback

    ;(schedulePostJob as jest.Mock).mockRejectedValueOnce(new Error('qstash failure'))

    const request = {
      json: jest.fn().mockResolvedValue({ postId: 'post-6' }),
    } as any

    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to schedule retry' })
    expect(mockAdminUpdate).toHaveBeenCalledTimes(2)
    expect(mockAdminEq).toHaveBeenCalledTimes(2)
  })
})
