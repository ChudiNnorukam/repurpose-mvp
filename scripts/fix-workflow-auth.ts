#!/usr/bin/env tsx
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_INSTANCE_URL = process.env.N8N_INSTANCE_URL?.replace(/\/$/, '');
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fixWorkflow() {
  console.log('🔧 Fixing Auto-Scheduler authentication...\n');

  const listResp = await fetch(`${N8N_INSTANCE_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY! }
  });
  const workflows = await listResp.json();
  const workflow = workflows.data?.find((w: any) => w.name.includes('Auto-Scheduler'));

  if (!workflow) {
    console.log('❌ Workflow not found');
    return;
  }

  console.log(`✅ Found: ${workflow.name}`);

  workflow.nodes.forEach((node: any) => {
    if (node.name === 'Call Schedule API') {
      console.log(`\n🔧 Updating API call with authentication...`);
      
      // Update to use new internal endpoint
      node.parameters.url = `${APP_URL}/api/schedule-internal`;
      
      // Add Authorization header with service role key
      node.parameters.headerParameters = {
        parameters: [
          {
            name: 'Authorization',
            value: `Bearer ${SERVICE_ROLE_KEY}`
          },
          {
            name: 'Content-Type',
            value: 'application/json'
          }
        ]
      };

      // Update JSON body to match new endpoint
      node.parameters.jsonBody = `={{ JSON.stringify({
  postId: $json.id,
  userId: $json.user_id,
  platform: $json.platform,
  content: $json.content,
  scheduledTime: $json.scheduled_time
}) }}`;

      console.log(`   URL: ${APP_URL}/api/schedule-internal`);
      console.log(`   Auth: Bearer ${SERVICE_ROLE_KEY.substring(0, 20)}...`);
    }
  });

  const updateResp = await fetch(`${N8N_INSTANCE_URL}/api/v1/workflows/${workflow.id}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {}
    })
  });

  if (!updateResp.ok) {
    console.error('❌ Failed:', await updateResp.text());
    return;
  }

  console.log('\n✅ Workflow updated with authentication!');
  console.log('\n🎯 Try executing the workflow again');
}

fixWorkflow();
