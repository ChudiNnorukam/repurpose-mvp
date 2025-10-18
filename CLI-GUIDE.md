# CLI Guide - No More Manual SQL!

**Purpose**: Run database operations and trigger workflows from your terminal
**Created**: January 18, 2025

---

## 🎉 What You Can Do Now

### Create Posts (No SQL Copy-Paste!)

```bash
npm run create-post
```

**What it does**:
- Creates "Prompt Rehab #3" post in database
- Schedules it for 2 minutes from now
- Shows you the post ID and details
- Ready to be picked up by Auto-Scheduler

**Customize the post**:
Edit `scripts/create-post.ts` to change:
- Content (the `PROMPT_REHAB_3` variable)
- Platform (`'linkedin'` or `'twitter'`)
- Scheduled time (default: 2 minutes)

---

### Trigger n8n Workflows (Manual Testing)

```bash
# Trigger Auto-Scheduler
npm run trigger-scheduler

# Trigger Content Personalizer
npm run trigger-personalizer

# Trigger Quality Gate
npm run trigger-quality-gate

# Trigger Engagement Monitor
npm run trigger-engagement
```

**What it does**:
- Calls n8n API to execute the workflow immediately
- No need to wait for scheduled execution
- Perfect for testing

**Note**: The `/execute` endpoint requires n8n Cloud Starter plan or higher. If you get "not found", use manual execution in n8n UI or wait for scheduled run.

---

## 🚀 Complete Test Workflow

**Test Prompt Rehab #3 posting to LinkedIn**:

```bash
# Step 1: Create the post in database
npm run create-post

# Step 2: Trigger Auto-Scheduler (or use n8n UI)
# Visit: https://chudinnorukam.app.n8n.cloud/workflows
# Click "Repurpose Auto-Scheduler" → "Execute Workflow"

# Step 3: Wait 2 minutes

# Step 4: Check LinkedIn for your post!
```

---

## 📝 npm Scripts Reference

| Command | What It Does |
|---------|--------------|
| `npm run create-post` | Create a post in `scheduled_posts` table |
| `npm run trigger-scheduler` | Trigger Auto-Scheduler workflow |
| `npm run trigger-personalizer` | Trigger Content Personalizer workflow |
| `npm run trigger-quality-gate` | Trigger Quality Gate workflow |
| `npm run trigger-engagement` | Trigger Engagement Monitor workflow |
| `npm run setup:n8n` | Import all workflows to n8n (one-time setup) |

---

## 🔧 Supabase CLI (Installed & Linked)

### Check Connection

```bash
supabase --version
# Output: 2.51.0
```

### Run Migrations

```bash
# Push new migrations to production
supabase db push

# Pull schema from production
supabase db pull
```

### Direct SQL Queries

Unfortunately, the Supabase CLI doesn't have a direct `db query` command for remote databases. But you can use TypeScript scripts instead (like `create-post.ts`).

---

## 🎯 Real-World Examples

### Example 1: Batch Create Multiple Posts

**Create a new script**: `scripts/batch-create-posts.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const POSTS = [
  {
    platform: 'linkedin',
    content: 'Post 1 content here...',
    scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  },
  {
    platform: 'twitter',
    content: 'Post 2 content here...',
    scheduled_time: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days
  },
  // Add more...
];

async function batchCreate() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users!.users[0].id;

  for (const post of POSTS) {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        platform: post.platform,
        content: post.content,
        scheduled_time: post.scheduled_time.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to create post:`, error);
    } else {
      console.log(`✅ Created ${post.platform} post (ID: ${data.id})`);
    }
  }
}

batchCreate();
```

**Add to package.json**:
```json
"batch-create": "tsx scripts/batch-create-posts.ts"
```

**Run**:
```bash
npm run batch-create
```

---

### Example 2: Check Post Status

**Create**: `scripts/check-status.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStatus() {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('\n📊 Recent Posts:\n');
  data?.forEach((post: any) => {
    console.log(`${post.platform.toUpperCase()} | ${post.status}`);
    console.log(`   Content: ${post.content.substring(0, 60)}...`);
    console.log(`   Scheduled: ${post.scheduled_time}`);
    console.log(`   AI Reviewed: ${post.ai_reviewed ? '✅' : '❌'}`);
    console.log(`   Compliant: ${post.compliance_checked ? (post.compliant ? '✅' : '⚠️') : '❌'}`);
    console.log('');
  });
}

checkStatus();
```

**Add to package.json**:
```json
"check-status": "tsx scripts/check-status.ts"
```

**Run**:
```bash
npm run check-status
```

---

### Example 3: Delete Test Data

**Create**: `scripts/cleanup.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanup() {
  // Delete posts containing "Prompt Rehab"
  const { data, error } = await supabase
    .from('scheduled_posts')
    .delete()
    .ilike('content', '%Prompt Rehab%')
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Deleted ${data?.length || 0} test posts`);
}

cleanup();
```

**Add to package.json**:
```json
"cleanup": "tsx scripts/cleanup.ts"
```

**Run**:
```bash
npm run cleanup
```

---

## 🎯 Summary

**Before** (Manual SQL):
1. Open Supabase dashboard
2. Click SQL Editor
3. Copy SQL from file
4. Paste and run
5. Copy results
6. Repeat for every test

**After** (CLI):
```bash
npm run create-post
```

**Time saved**: ~2 minutes per operation → **hours per week**

---

## 🚨 Important Notes

### n8n Workflow Triggering

The `/api/v1/workflows/{id}/execute` endpoint **requires n8n Cloud Starter plan or higher**.

**If you get "not found" error**:
- Use manual execution in n8n UI (click "Execute Workflow" button)
- Or wait for scheduled execution (Auto-Scheduler runs every 6 hours)

**Alternative**: You can add webhook triggers to workflows and call those instead.

### Supabase Service Role Key

All scripts use `SUPABASE_SERVICE_ROLE_KEY` which **bypasses RLS**.

**Security**:
- ✅ Fine for development and automation
- ⚠️ Never expose this key in client-side code
- ⚠️ Keep `.env.local` in `.gitignore`

---

## 📚 Next Steps

1. **Customize `create-post.ts`** for your content
2. **Create batch scripts** for 30-day content generation
3. **Add status checking** to monitor automation
4. **Set up cleanup** for test data

**Questions?** See:
- `n8n-workflows/TESTING-GUIDE.md` - Workflow testing
- `n8n-workflows/WORKFLOW-OUTPUTS-GUIDE.md` - Understanding outputs
- `n8n-workflows/README-SETUP.md` - Initial setup

---

**Last Updated**: January 18, 2025
**Status**: ✅ CLI Ready - No More Manual SQL!
