import { supabaseAdmin } from '@/lib/supabase/admin'
import { decrypt } from '@/lib/crypto/encrypt'

/**
 * Get LinkedIn access token for account
 */
export async function getLinkedInAccessToken(accountId: string): Promise<string> {
  const { data: account, error } = await supabaseAdmin
    .from('social_accounts')
    .select('access_token, platform')
    .eq('id', accountId)
    .eq('platform', 'linkedin')
    .single()

  if (error || !account) {
    throw new Error(`LinkedIn account not found: ${error?.message}`)
  }

  return decrypt(account.access_token)
}

interface LinkedInPostPayload {
  text: string
  mediaUrls?: string[]
  articleLink?: string
}

interface PostResult {
  success: boolean
  postId: string
  postUrl: string
}

/**
 * Post to LinkedIn personal profile
 */
export async function postToLinkedInProfile(
  accountId: string,
  content: LinkedInPostPayload
): Promise<PostResult> {
  const accessToken = await getLinkedInAccessToken(accountId)

  // Get LinkedIn person ID
  const { data: account } = await supabaseAdmin
    .from('social_accounts')
    .select('platform_user_id')
    .eq('id', accountId)
    .single()

  if (!account?.platform_user_id) {
    throw new Error('LinkedIn person ID not found')
  }

  const personUrn = `urn:li:person:${account.platform_user_id}`

  // Build post payload
  const postData: any = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content.text },
        shareMediaCategory: content.mediaUrls ? 'IMAGE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  // Add media if present
  if (content.mediaUrls?.length) {
    const mediaAssets = await uploadMediaToLinkedIn(
      accessToken,
      personUrn,
      content.mediaUrls
    )
    postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets
  }

  // Add article link if present
  if (content.articleLink) {
    postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory =
      'ARTICLE'
    postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
      { status: 'READY', originalUrl: content.articleLink },
    ]
  }

  // Post to LinkedIn
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn API error: ${response.status} - ${error}`)
  }

  const result = await response.json()
  const postId = result.id

  return {
    success: true,
    postId,
    postUrl: `https://www.linkedin.com/feed/update/${postId}/`,
  }
}

/**
 * Upload media to LinkedIn
 */
async function uploadMediaToLinkedIn(
  accessToken: string,
  ownerUrn: string,
  mediaUrls: string[]
): Promise<any[]> {
  const mediaAssets = []

  for (const url of mediaUrls) {
    try {
      // Step 1: Register upload
      const registerResponse = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: ownerUrn,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          }),
        }
      )

      if (!registerResponse.ok) {
        console.error(`Failed to register media upload: ${registerResponse.status}`)
        continue
      }

      const registerData = await registerResponse.json()
      const uploadUrl =
        registerData.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl
      const asset = registerData.value.asset

      // Step 2: Upload media
      const mediaResponse = await fetch(url)
      const mediaBuffer = await mediaResponse.arrayBuffer()

      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: mediaBuffer,
      })

      if (!uploadResult.ok) {
        console.error(`Failed to upload media: ${uploadResult.status}`)
        continue
      }

      mediaAssets.push({ status: 'READY', media: asset })
    } catch (error) {
      console.error(`Failed to upload media from ${url}:`, error)
    }
  }

  return mediaAssets
}

/**
 * Post LinkedIn carousel (as document)
 */
export async function postLinkedInCarousel(
  accountId: string,
  pdfUrl: string,
  caption: string
): Promise<PostResult> {
  const accessToken = await getLinkedInAccessToken(accountId)

  const { data: account } = await supabaseAdmin
    .from('social_accounts')
    .select('platform_user_id')
    .eq('id', accountId)
    .single()

  if (!account?.platform_user_id) {
    throw new Error('LinkedIn person ID not found')
  }

  const personUrn = `urn:li:person:${account.platform_user_id}`

  // Upload PDF as document
  const documentAsset = await uploadDocumentToLinkedIn(accessToken, personUrn, pdfUrl)

  // Create post with document
  const postData = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: caption },
        shareMediaCategory: 'DOCUMENT',
        media: [{ status: 'READY', media: documentAsset }],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn API error: ${error}`)
  }

  const result = await response.json()

  return {
    success: true,
    postId: result.id,
    postUrl: `https://www.linkedin.com/feed/update/${result.id}/`,
  }
}

/**
 * Upload document to LinkedIn
 */
async function uploadDocumentToLinkedIn(
  accessToken: string,
  ownerUrn: string,
  pdfUrl: string
): Promise<string> {
  // Register document upload
  const registerResponse = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-document'],
          owner: ownerUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    }
  )

  if (!registerResponse.ok) {
    throw new Error(`Failed to register document upload: ${registerResponse.status}`)
  }

  const registerData = await registerResponse.json()
  const uploadUrl =
    registerData.value.uploadMechanism[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ].uploadUrl
  const asset = registerData.value.asset

  // Upload PDF
  const pdfResponse = await fetch(pdfUrl)
  const pdfBuffer = await pdfResponse.arrayBuffer()

  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/pdf',
    },
    body: pdfBuffer,
  })

  if (!uploadResult.ok) {
    throw new Error(`Failed to upload document: ${uploadResult.status}`)
  }

  return asset
}

interface LinkedInAnalytics {
  likes: number
  comments: number
  shares: number
  impressions: number
  clicks: number
}

/**
 * Fetch LinkedIn post analytics
 */
export async function getLinkedInAnalytics(
  accountId: string,
  postId: string
): Promise<LinkedInAnalytics> {
  const accessToken = await getLinkedInAccessToken(accountId)

  try {
    const response = await fetch(`https://api.linkedin.com/v2/socialActions/${postId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn analytics: ${response.status}`)
    }

    const data = await response.json()

    return {
      likes: data.likesSummary?.totalLikes || 0,
      comments: data.commentsSummary?.totalComments || 0,
      shares: data.sharesSummary?.totalShares || 0,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
    }
  } catch (error) {
    console.error('Failed to fetch LinkedIn analytics:', error)
    return { likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 }
  }
}

/**
 * Verify LinkedIn account access
 */
export async function verifyLinkedInAccount(accountId: string): Promise<boolean> {
  try {
    const accessToken = await getLinkedInAccessToken(accountId)

    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Revoke LinkedIn token
 */
export async function revokeLinkedInToken(accountId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('social_accounts')
    .update({ is_active: false })
    .eq('id', accountId)
    .eq('platform', 'linkedin')

  if (error) {
    throw new Error(`Failed to revoke token: ${error.message}`)
  }
}
