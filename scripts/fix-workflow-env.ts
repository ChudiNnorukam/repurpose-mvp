#!/usr/bin/env tsx
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_INSTANCE_URL = process.env.N8N_INSTANCE_URL?.replace(/\/$/, '');
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

async function fixWorkflow() {
  console.log('🔧 Fixing Auto-Scheduler environment variable access...\n');

  // Get workflow
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

  // Fix the Call Schedule API node
  workflow.nodes.forEach((node: any) => {
    if (node.name === 'Call Schedule API') {
      console.log(`\n🔧 Fixing API URL...`);
      console.log(`   Old: {{ $env.NEXT_PUBLIC_APP_URL }}/api/schedule`);
      console.log(`   New: ${APP_URL}/api/schedule`);

      node.parameters.url = `${APP_URL}/api/schedule`;
    }
  });

  // Update workflow
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

  console.log('\n✅ Fixed successfully!');
  console.log('\n🎯 Try executing the workflow again');
}

fixWorkflow();
