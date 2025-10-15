import { logger } from "@/lib/logger"

const META_APP_ID = process.env.META_APP_ID
const META_APP_SECRET = process.env.META_APP_SECRET
const GRAPH_API_VERSION = "v19.0"
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`
const FACEBOOK_OAUTH_URL = `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth`
const REQUIRED_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_insights",
  "instagram_content_publish",
] as const

if (!META_APP_ID || !META_APP_SECRET) {
  logger.warn("Instagram OAuth credentials are not fully configured")
}

export interface InstagramAuthResult {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  userId?: string
  instagramBusinessAccountId?: string
  facebookPageId?: string
}

interface PageAccount {
  id: string
  name?: string
  instagram_business_account?: { id: string }
}

export function getInstagramAuthUrl(state: string): string {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`
  const authUrl = new URL(FACEBOOK_OAUTH_URL)

  authUrl.searchParams.append("client_id", META_APP_ID ?? "")
  authUrl.searchParams.append("redirect_uri", callbackUrl)
  authUrl.searchParams.append("state", state)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("scope", REQUIRED_SCOPES.join(","))

  return authUrl.toString()
}

export async function exchangeInstagramCode(code: string): Promise<InstagramAuthResult> {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`

  const tokenParams = new URLSearchParams({
    client_id: META_APP_ID ?? "",
    client_secret: META_APP_SECRET ?? "",
    redirect_uri: callbackUrl,
    code,
  })

  const shortLivedResponse = await fetch(`${GRAPH_BASE_URL}/oauth/access_token`, {
    method: "POST",
    body: tokenParams,
  })

  if (!shortLivedResponse.ok) {
    const errorText = await shortLivedResponse.text()
    throw new Error(`Instagram token exchange failed: ${errorText}`)
  }

  const shortLivedJson = await shortLivedResponse.json()
  const shortLivedToken: string = shortLivedJson.access_token
  const expiresIn: number | undefined = shortLivedJson.expires_in

  // Exchange for a long-lived token when possible
  const exchangeParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: META_APP_ID ?? "",
    client_secret: META_APP_SECRET ?? "",
    fb_exchange_token: shortLivedToken,
  })

  const longLivedResponse = await fetch(`${GRAPH_BASE_URL}/oauth/access_token`, {
    method: "POST",
    body: exchangeParams,
  })

  let accessToken = shortLivedToken
  let longLivedExpiresIn = expiresIn

  if (longLivedResponse.ok) {
    const longLivedJson = await longLivedResponse.json()
    accessToken = longLivedJson.access_token ?? shortLivedToken
    longLivedExpiresIn = longLivedJson.expires_in ?? expiresIn
  } else {
    const exchangeError = await longLivedResponse.text()
    logger.warn("Failed to exchange Instagram token for long-lived version", { error: exchangeError })
  }

  const businessAccount = await fetchInstagramBusinessAccount(accessToken)

  return {
    accessToken,
    refreshToken: accessToken,
    expiresIn: longLivedExpiresIn,
    userId: businessAccount?.userId,
    instagramBusinessAccountId: businessAccount?.instagramBusinessAccountId,
    facebookPageId: businessAccount?.facebookPageId,
  }
}

async function fetchInstagramBusinessAccount(accessToken: string): Promise<{
  instagramBusinessAccountId?: string
  facebookPageId?: string
  userId?: string
}> {
  const response = await fetch(
    `${GRAPH_BASE_URL}/me/accounts?fields=id,name,instagram_business_account&access_token=${encodeURIComponent(accessToken)}`
  )

  if (!response.ok) {
    const errorText = await response.text()
    logger.warn("Unable to fetch connected Facebook pages for Instagram", { error: errorText })
    return {}
  }

  const json = await response.json()
  const pages: PageAccount[] = json.data ?? []
  const pageWithInstagram = pages.find((page) => page.instagram_business_account?.id)

  if (!pageWithInstagram) {
    logger.warn("No Instagram business account connected to the Facebook user")
    return {}
  }

  return {
    instagramBusinessAccountId: pageWithInstagram.instagram_business_account?.id,
    facebookPageId: pageWithInstagram.id,
    userId: pageWithInstagram.id,
  }
}

interface InstagramPostOptions {
  instagramBusinessAccountId: string
  caption: string
  imageUrl?: string
}

export async function postToInstagram(accessToken: string, options: InstagramPostOptions): Promise<string> {
  const { instagramBusinessAccountId, caption, imageUrl } = options
  const mediaUrl = imageUrl ?? process.env.INSTAGRAM_DEFAULT_IMAGE_URL

  if (!mediaUrl) {
    throw new Error(
      "Instagram posting requires an image URL. Provide one explicitly or configure INSTAGRAM_DEFAULT_IMAGE_URL."
    )
  }

  // Create media container with caption and image
  const containerResponse = await fetch(`${GRAPH_BASE_URL}/${instagramBusinessAccountId}/media`, {
    method: "POST",
    body: new URLSearchParams({
      access_token: accessToken,
      caption,
      image_url: mediaUrl,
    }),
  })

  if (!containerResponse.ok) {
    const errorText = await containerResponse.text()
    throw new Error(`Instagram media creation failed: ${errorText}`)
  }

  const containerJson = await containerResponse.json()
  const creationId = containerJson.id

  if (!creationId) {
    throw new Error("Instagram did not return a media creation ID")
  }

  // Publish the media container
  const publishResponse = await fetch(`${GRAPH_BASE_URL}/${instagramBusinessAccountId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({
      access_token: accessToken,
      creation_id: creationId,
    }),
  })

  if (!publishResponse.ok) {
    const errorText = await publishResponse.text()
    throw new Error(`Instagram publish failed: ${errorText}`)
  }

  const publishJson = await publishResponse.json()
  return publishJson.id ?? creationId
}
