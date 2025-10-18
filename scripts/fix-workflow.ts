#!/usr/bin/env tsx
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_INSTANCE_URL = process.env.N8N_INSTANCE_URL?.replace(/\/$/, '');

async function fixWorkflow() {
  console.log('🔧 Fixing Auto-Scheduler workflow...\n');

  // Get all workflows
  const listResp = await fetch(`${N8N_INSTANCE_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY! }
  });
  const workflows = await listResp.json();

  // Find Auto-Scheduler
  const workflow = workflows.data?.find((w: any) => w.name.includes('Auto-Scheduler'));
  if (!workflow) {
    console.log('❌ No Auto-Scheduler workflow found');
    console.log('\n📋 Available workflows:');
    workflows.data?.forEach((w: any) => console.log(`   - ${w.name}`));
    return;
  }

  console.log(`✅ Found: ${workflow.name} (ID: ${workflow.id})`);

  // Update the Supabase node parameters
  let fixed = false;
  workflow.nodes.forEach((node: any) => {
    if (node.name === 'Get Pending Posts') {
      console.log('\n🔧 Fixing "Get Pending Posts" node...');
      console.log(`   Old parameters:`, JSON.stringify(node.parameters, null, 2));

      node.parameters = {
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'supabaseApi',
        resource: 'row',
        operation: 'getAll',
        tableId: 'scheduled_posts',
        returnAll: true,
        additionalOptions: {
          filter: 'status=eq.pending'
        }
      };

      console.log(`   New parameters:`, JSON.stringify(node.parameters, null, 2));
      fixed = true;
    }
  });

  if (!fixed) {
    console.log('❌ Could not find "Get Pending Posts" node');
    console.log('\n📋 Available nodes:');
    workflow.nodes.forEach((n: any) => console.log(`   - ${n.name}`));
    return;
  }

  // Update workflow
  console.log('\n📤 Updating workflow in n8n...');
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
      // Don't include 'active' - it's read-only
    })
  });

  if (!updateResp.ok) {
    console.error('❌ Failed to update:', await updateResp.text());
    return;
  }

  console.log('✅ Workflow updated successfully!');
  console.log('\n🎯 Next steps:');
  console.log('   1. Visit: https://chudinnorukam.app.n8n.cloud/workflows');
  console.log(`   2. Open: ${workflow.name}`);
  console.log('   3. Click "Execute Workflow"');
  console.log('   4. Should work now! ✅');
}

fixWorkflow();
