export function getLinkedInAuthUrl(state: string): string {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
  const clientId = process.env.LINKEDIN_CLIENT_ID!

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', callbackUrl)
  authUrl.searchParams.append('state', state)
  authUrl.searchParams.append('scope', 'openid profile email w_member_social')

  return authUrl.toString()
}

export async function getLinkedInAccessToken(code: string): Promise<{ accessToken: string }> {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: callbackUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn token exchange failed: ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
  }
}

export async function getLinkedInUser(accessToken: string): Promise<{ id: string; name: string }> {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get LinkedIn user info')
  }

  const data = await response.json()
  return {
    id: data.sub,
    name: data.name,
  }
}

type LinkedInPostError = Error & { status?: number; details?: unknown }

interface LinkedInPostSuccessResponse {
  id?: string
  entityUrn?: string
  resource?: string
  resourceUrn?: string
  value?: string
}

export type LinkedInErrorResponse = {
  message?: string
  status?: number
  serviceErrorCode?: number
  details?: Array<{ message?: string }>
  [key: string]: unknown
}

export async function postToLinkedIn(accessToken: string, content: string): Promise<string> {
  // First, get the user's URN
  const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!userResponse.ok) {
    throw new Error('Failed to get LinkedIn user info')
  }

  const userData = await userResponse.json()
  const authorUrn = `urn:li:person:${userData.sub}`

  // Create the post using LinkedIn's REST API schema
  const postData = {
    author: authorUrn,
    commentary: content,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }

  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202405',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    const rawErrorBody = await response.text()
    let parsedError: LinkedInErrorResponse | undefined

    if (rawErrorBody) {
      try {
        parsedError = JSON.parse(rawErrorBody)
      } catch {
        // noop - use raw body below
      }
    }

    const linkedInMessage =
      parsedError?.message ||
      parsedError?.details?.find((detail) => detail.message)?.message ||
      rawErrorBody ||
      `LinkedIn API responded with status ${response.status}`

    const error: LinkedInPostError = new Error(`Failed to post to LinkedIn: ${linkedInMessage}`)
    error.status = parsedError?.status ?? response.status
    if (parsedError) {
      error.details = parsedError
    }

    throw error
  }

  let result: LinkedInPostSuccessResponse | undefined
  try {
    result = await response.json()
  } catch {
    // LinkedIn may not always return a JSON body; fall back to headers
    result = undefined
  }

  const possibleUrns = [
    result?.resourceUrn,
    result?.entityUrn,
    result?.resource,
    result?.id,
    result?.value,
    response.headers.get('x-restli-id') ?? undefined,
  ].filter((value): value is string => Boolean(value && value.length > 0))

  const resourceUrn = possibleUrns[0]

  if (!resourceUrn) {
    throw new Error('LinkedIn post created but response did not include a resource URN')
  }

  return resourceUrn
}
