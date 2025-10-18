-- Verify tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('scheduled_posts', 'published_posts', 'engagement_queue')
ORDER BY table_name;

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('scheduled_posts', 'published_posts', 'engagement_queue');

-- Check indexes created
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('scheduled_posts', 'published_posts', 'engagement_queue')
ORDER BY tablename, indexname;
