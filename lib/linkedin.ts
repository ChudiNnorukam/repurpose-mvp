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

  // Create the post
  const postData = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to post to LinkedIn: ${error}`)
  }

  const result = await response.json()
  return result.id
}
