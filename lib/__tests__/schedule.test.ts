import { z } from 'zod'
import {
  scheduleRequestSchema,
  validateScheduledTimestamp,
  ScheduleValidationError,
  scheduleValidationConstants,
} from '@/app/api/schedule/validation'

describe('scheduleRequestSchema', () => {
  it('accepts a valid payload', () => {
    const payload = {
      platform: 'twitter',
      content: 'Test content',
      originalContent: 'Original content',
      scheduledTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      userId: '00000000-0000-0000-0000-000000000000',
      metadata: {
        timezoneOffsetMinutes: -300,
        requestSource: 'unit-test',
      },
    }

    expect(() => scheduleRequestSchema.parse(payload)).not.toThrow()
  })

  it('rejects missing fields', () => {
    const payload = {
      content: 'Missing platform',
      scheduledTime: new Date().toISOString(),
      userId: '00000000-0000-0000-0000-000000000000',
    }

    const result = scheduleRequestSchema.safeParse(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues
      expect(issues.some((issue) => issue.path.includes('platform'))).toBe(true)
    }
  })

  it('enforces platform enumeration', () => {
    const payload = {
      platform: 'facebook',
      content: 'Invalid platform',
      scheduledTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      userId: '00000000-0000-0000-0000-000000000000',
    }

    expect(() => scheduleRequestSchema.parse(payload)).toThrow(z.ZodError)
  })
})

describe('validateScheduledTimestamp', () => {
  it('returns a Date for future timestamps within range', () => {
    const target = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const parsed = validateScheduledTimestamp(target)
    expect(parsed).toBeInstanceOf(Date)
    expect(parsed.toISOString()).toBe(target)
  })

  it('throws ScheduleValidationError when timestamp is in the past', () => {
    const target = new Date(Date.now() - 60 * 1000).toISOString()
    expect(() => validateScheduledTimestamp(target)).toThrow(ScheduleValidationError)
  })

  it('throws ScheduleValidationError when timestamp is beyond max range', () => {
    const future = new Date(
      Date.now() + (scheduleValidationConstants.MAX_FUTURE_DAYS + 1) * 24 * 60 * 60 * 1000,
    ).toISOString()

    expect(() => validateScheduledTimestamp(future)).toThrow(ScheduleValidationError)
  })
})
