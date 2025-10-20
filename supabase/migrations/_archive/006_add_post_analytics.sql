-- Add analytics fields to posts table
ALTER TABLE posts
ADD COLUMN platform_post_id TEXT,
ADD COLUMN post_url TEXT;

-- Add index for faster lookups by platform_post_id
CREATE INDEX IF NOT EXISTS idx_posts_platform_post_id ON posts(platform_post_id);

-- Add comment explaining the fields
COMMENT ON COLUMN posts.platform_post_id IS 'ID of the post on the social media platform (e.g., Tweet ID, LinkedIn post ID)';
COMMENT ON COLUMN posts.post_url IS 'Direct URL to the published post on the social media platform';
