-- Test Data for n8n Workflows
-- Run this in Supabase SQL Editor to create test posts

-- Step 1: Get your user ID (replace with your actual user ID from auth.users table)
-- SELECT id FROM auth.users LIMIT 1;

-- Step 2: Insert test scheduled posts (UPDATE the user_id below!)
INSERT INTO scheduled_posts (
  user_id,
  platform,
  content,
  original_content,
  scheduled_time,
  status
) VALUES
  -- Test 1: Auto-Scheduler workflow (pending post)
  (
    (SELECT id FROM auth.users LIMIT 1),
    'twitter',
    'Just shipped a major feature update! Check out the new content calendar 🚀',
    'Just shipped a major feature update! Check out the new content calendar 🚀',
    NOW() + INTERVAL '2 hours',
    'pending'
  ),

  -- Test 2: Content Personalizer workflow (needs AI review)
  (
    (SELECT id FROM auth.users LIMIT 1),
    'linkedin',
    'Excited to delve into the latest AI trends and unlock new opportunities in automation.',
    'Excited to delve into the latest AI trends and unlock new opportunities in automation.',
    NOW() + INTERVAL '1 day',
    'pending'
  ),

  -- Test 3: Quality Gate workflow (needs compliance check)
  (
    (SELECT id FROM auth.users LIMIT 1),
    'twitter',
    'Follow me for daily tips on productivity and business growth!',
    'Follow me for daily tips on productivity and business growth!',
    NOW() + INTERVAL '3 days',
    'pending'
  );

-- Verify test data created
SELECT
  id,
  platform,
  LEFT(content, 50) as content_preview,
  scheduled_time,
  status,
  ai_reviewed,
  compliance_checked
FROM scheduled_posts
ORDER BY created_at DESC
LIMIT 5;
