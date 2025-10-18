import { NextResponse } from "next/server"

/**
 * TEMPORARY DIAGNOSTIC ENDPOINT
 * DO NOT KEEP IN PRODUCTION - DELETE AFTER DEBUGGING
 */
export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    exists: !!key,
    length: key?.length || 0,
    first30: key?.substring(0, 30) || 'undefined',
    last10: key?.substring(key.length - 10) || 'undefined',
    // Check for common issues
    hasLeadingSpace: key?.[0] === ' ',
    hasTrailingSpace: key?.[key.length - 1] === ' ',
    hasNewline: key?.includes('\n'),
    typeof: typeof key,
  })
}
