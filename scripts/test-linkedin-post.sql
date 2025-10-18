-- Test Post: Prompt Rehab #3 → LinkedIn
-- This will test the full workflow: Database → Auto-Scheduler → QStash → Post to LinkedIn

-- Step 1: Insert the test post as "pending" (will be picked up by Auto-Scheduler)
INSERT INTO scheduled_posts (
  user_id,
  platform,
  content,
  original_content,
  scheduled_time,
  status
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'linkedin',
  'Prompt Rehab #3 — Context is your cheat code

Most people prompt like they''re texting a coworker.
Short. Vague. Assuming the AI knows the backstory.

It doesn''t.

❌ "Write a LinkedIn post about AI workflows."
❌ "Draft an email to my team."
❌ "Summarize this article."

You''re sending the AI into a room blindfolded.
No wonder it gives you generic nonsense.

Here''s the unlock: context isn''t extra work, it''s the whole game 👇

✅ "You''re a developer advocate writing for CTOs at B2B SaaS companies. Draft a 200-word LinkedIn post about n8n automation workflows. Tone: technical but approachable. Hook: start with a pain point about manual processes. End with a question to drive engagement."

Why it works:
• "Developer advocate for CTOs" = audience + authority.
• "200 words" = precise output constraint.
• "Tone: technical but approachable" = voice guardrails.
• "Hook / end with" = structure blueprint.
• You''ve given it a job description, not just a task.

The more context you front-load, the less editing you do later.
Think of it like briefing a freelancer: if you skip the brief, you get 5 rounds of revisions.

#PromptEngineering #AIWorkflows #DevTools #BuildInPublic #LearningInPublic #n8n',
  'Prompt Rehab #3 — Context is your cheat code',
  NOW() + INTERVAL '2 minutes',  -- Schedule for 2 minutes from now
  'pending'
)
RETURNING id, platform, scheduled_time, status;

-- Step 2: Verify the post was created
SELECT
  id,
  platform,
  LEFT(content, 100) as content_preview,
  scheduled_time,
  status,
  ai_reviewed,
  compliance_checked,
  created_at
FROM scheduled_posts
WHERE platform = 'linkedin'
  AND content LIKE '%Prompt Rehab #3%'
ORDER BY created_at DESC
LIMIT 1;
