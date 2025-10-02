import { TwitterApi } from 'twitter-api-v2'

const clientId = process.env.TWITTER_CLIENT_ID
const clientSecret = process.env.TWITTER_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.warn('Twitter OAuth credentials not configured')
}

// Generate OAuth 2.0 authorization URL
export function getTwitterAuthUrl(state: string): string {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`

  const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', clientId!)
  authUrl.searchParams.append('redirect_uri', callbackUrl)
  authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access')
  authUrl.searchParams.append('state', state)
  authUrl.searchParams.append('code_challenge', 'challenge')
  authUrl.searchParams.append('code_challenge_method', 'plain')

  return authUrl.toString()
}

// Exchange authorization code for access token
export async function getTwitterAccessToken(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`

  const client = new TwitterApi({
    clientId: clientId!,
    clientSecret: clientSecret!,
  })

  const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
    code,
    codeVerifier: 'challenge',
    redirectUri: callbackUrl,
  })

  return {
    accessToken,
    refreshToken: refreshToken || '',
    expiresIn: expiresIn || 7200,
  }
}

// Get Twitter user info
export async function getTwitterUser(accessToken: string) {
  const client = new TwitterApi(accessToken)
  const { data: user } = await client.v2.me()
  return user
}

// Post a tweet
export async function postTweet(accessToken: string, content: string): Promise<string> {
  const client = new TwitterApi(accessToken)
  const { data } = await client.v2.tweet(content)
  return data.id
}

// Refresh access token
export async function refreshTwitterToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const client = new TwitterApi({
    clientId: clientId!,
    clientSecret: clientSecret!,
  })

  const { accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token(refreshToken)

  return {
    accessToken,
    refreshToken: newRefreshToken || refreshToken,
  }
}
