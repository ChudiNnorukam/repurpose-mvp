import { getSupabaseAdmin } from "@/lib/supabase"
import { logger } from "@/lib/logger"

interface SocialAccount {
  id: string
  access_token: string
  refresh_token?: string | null
}

/**
 * Refreshes OAuth access token if a refresh token is available
 *
 * Attempts to obtain a new access token using the refresh token for Twitter or LinkedIn.
 * If refresh fails or no refresh token exists, returns the existing access token.
 *
 * @param account - Social account with access token and optional refresh token
 * @param platform - Social media platform ('twitter' or 'linkedin')
 * @returns Fresh access token (new if refreshed, existing if refresh failed/unavailable)
 *
 * @example
 * const freshToken = await refreshIfNeeded(
 *   { id: '123', access_token: 'old_token', refresh_token: 'refresh_token' },
 *   'twitter'
 * )
 */
export async function refreshIfNeeded(account: SocialAccount, platform: string): Promise<string> {
  // If no refresh token, return existing access token
  if (!account.refresh_token) {
    return account.access_token
  }

  let tokenEndpoint = ""
  let params: Record<string, string> = {}
  let method: "POST" | "GET" = "POST"

  if (platform === "twitter") {
    tokenEndpoint = "https://api.twitter.com/2/oauth2/token"
    params = {
      client_id: process.env.TWITTER_CLIENT_ID!,
      client_secret: process.env.TWITTER_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }
  } else if (platform === "linkedin") {
    tokenEndpoint = "https://www.linkedin.com/oauth/v2/accessToken"
    params = {
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }
  } else if (platform === "instagram") {
    tokenEndpoint = "https://graph.facebook.com/v19.0/refresh_access_token"
    params = {
      grant_type: "ig_refresh_token",
      access_token: account.refresh_token as string,
    }
    method = "GET"
  } else {
    // Unsupported platform, return existing token
    return account.access_token
  }

  try {
    const url =
      method === "GET"
        ? `${tokenEndpoint}?${new URLSearchParams(params).toString()}`
        : tokenEndpoint

    const res = await fetch(url, {
      method,
      headers: method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined,
      body: method === "POST" ? new URLSearchParams(params) : undefined,
    })

    if (!res.ok) {
      const errorText = await res.text()
      logger.warn('Failed to refresh token', { platform, accountId: account.id, error: errorText })
      return account.access_token
    }

    const json = await res.json()

    if (json.access_token) {
      const supabase = getSupabaseAdmin()
      await supabase
        .from("social_accounts")
        .update({
          access_token: json.access_token,
          refresh_token: json.refresh_token || (platform === "instagram" ? json.access_token : account.refresh_token),
        })
        .eq("id", account.id)

      logger.info('Token refreshed successfully', { platform, accountId: account.id })
      return json.access_token
    }

    return account.access_token
  } catch (error) {
    logger.error('Error refreshing token', error as Error, { platform, accountId: account.id })
    return account.access_token
  }
}
