-- Test Data for Engagement Monitor Workflow
-- This creates a fake "published post" so the workflow has something to check

-- Step 1: Insert a test published post
-- (The Engagement Monitor looks for posts published in the last 3 days)

INSERT INTO published_posts (
  user_id,
  platform,
  content,
  platform_post_id,  -- This would normally be the Twitter/LinkedIn post ID
  published_at,
  status
) VALUES
  -- Test Twitter post
  (
    (SELECT id FROM auth.users LIMIT 1),
    'twitter',
    'Just launched my automated content workflow using n8n and Next.js! 🚀 Ask me anything about the setup.',
    '1234567890123456789',  -- Fake Twitter ID (would normally be from Twitter API)
    NOW() - INTERVAL '1 day',
    'published'
  ),

  -- Test LinkedIn post
  (
    (SELECT id FROM auth.users LIMIT 1),
    'linkedin',
    'Excited to share my journey building an AI-powered content automation system. The results have been incredible!',
    'urn:li:share:7000000000000000000',  -- Fake LinkedIn URN
    NOW() - INTERVAL '2 days',
    'published'
  );

-- Step 2: Verify test data created
SELECT
  id,
  platform,
  LEFT(content, 50) as content_preview,
  platform_post_id,
  published_at,
  status
FROM published_posts
ORDER BY published_at DESC
LIMIT 5;

-- Step 3: Check if engagement_queue table exists and is empty
SELECT COUNT(*) as current_engagements FROM engagement_queue;
