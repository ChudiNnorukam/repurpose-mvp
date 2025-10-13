import { z } from "zod"
import { ErrorCode } from "@/lib/api/errors"
import { Platform } from "@/lib/types"

export const VALID_PLATFORMS = ["twitter", "linkedin", "instagram"] as const
export const MIN_FUTURE_SECONDS = 60
export const MAX_FUTURE_DAYS = 180

export const scheduleRequestSchema = z.object({
  platform: z.enum(VALID_PLATFORMS),
  content: z.string().min(1, "content is required"),
  originalContent: z.string().optional(),
  scheduledTime: z.string().min(1, "scheduledTime is required"),
  userId: z.string().uuid("userId must be a valid UUID"),
  metadata: z
    .object({
      timezoneOffsetMinutes: z.number().int().optional(),
      requestSource: z.string().optional(),
    })
    .optional(),
})

export type ScheduleRequestPayload = z.infer<typeof scheduleRequestSchema>

export class ScheduleValidationError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly field?: keyof ScheduleRequestPayload | string,
    public readonly details?: string,
  ) {
    super(message)
  }
}

export function validateScheduledTimestamp(
  isoString: string,
  now: Date = new Date(),
): Date {
  const parsed = new Date(isoString)

  if (Number.isNaN(parsed.getTime())) {
    throw new ScheduleValidationError(
      "Invalid scheduled time format. Please use a valid ISO 8601 timestamp.",
      ErrorCode.INVALID_TIME,
      "scheduledTime",
      `Received: ${isoString}`,
    )
  }

  const minAllowed = new Date(now.getTime() + MIN_FUTURE_SECONDS * 1000)
  if (parsed < minAllowed) {
    throw new ScheduleValidationError(
      `Scheduled time must be at least ${MIN_FUTURE_SECONDS} seconds in the future.`,
      ErrorCode.INVALID_TIME,
      "scheduledTime",
      `Scheduled: ${parsed.toISOString()}, Minimum: ${minAllowed.toISOString()}`,
    )
  }

  const maxAllowed = new Date(
    now.getTime() + MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000,
  )
  if (parsed > maxAllowed) {
    throw new ScheduleValidationError(
      `Scheduled time cannot be more than ${MAX_FUTURE_DAYS} days ahead.`,
      ErrorCode.INVALID_TIME,
      "scheduledTime",
      `Scheduled: ${parsed.toISOString()}, Maximum: ${maxAllowed.toISOString()}`,
    )
  }

  return parsed
}

export function isSupportedPlatform(platform: Platform): platform is typeof VALID_PLATFORMS[number] {
  return (VALID_PLATFORMS as readonly string[]).includes(platform)
}

export const scheduleValidationConstants = {
  MIN_FUTURE_SECONDS,
  MAX_FUTURE_DAYS,
}
