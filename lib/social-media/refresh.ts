import { getSupabaseAdmin } from "@/lib/supabase"

interface SocialAccount {
  id: string
  access_token: string
  refresh_token?: string | null
}

export async function refreshIfNeeded(account: SocialAccount, platform: string): Promise<string> {
  // If no refresh token, return existing access token
  if (!account.refresh_token) {
    return account.access_token
  }

  let tokenEndpoint = ""
  let params: Record<string, string> = {}

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
  } else {
    // Unsupported platform, return existing token
    return account.access_token
  }

  try {
    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params),
    })

    if (!res.ok) {
      console.error(`Failed to refresh ${platform} token:`, await res.text())
      return account.access_token
    }

    const json = await res.json()

    if (json.access_token) {
      const supabase = getSupabaseAdmin()
      await supabase
        .from("social_accounts")
        .update({
          access_token: json.access_token,
          refresh_token: json.refresh_token || account.refresh_token,
        })
        .eq("id", account.id)

      console.log(`✅ Refreshed ${platform} token for account ${account.id}`)
      return json.access_token
    }

    return account.access_token
  } catch (error) {
    console.error(`Error refreshing ${platform} token:`, error)
    return account.access_token
  }
}
