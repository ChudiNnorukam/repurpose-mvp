#!/usr/bin/env tsx
/**
 * CLI tool to trigger n8n workflows via API
 * Usage: npm run trigger-scheduler
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_INSTANCE_URL = process.env.N8N_INSTANCE_URL?.replace(/\/$/, '');

if (!N8N_API_KEY || !N8N_INSTANCE_URL) {
  console.error('❌ Missing N8N_API_KEY or N8N_INSTANCE_URL in .env.local');
  process.exit(1);
}

async function triggerWorkflow(workflowName: string) {
  console.log(`🚀 Triggering "${workflowName}" workflow...\n`);

  // Step 1: Get workflow ID by name
  const listResponse = await fetch(`${N8N_INSTANCE_URL}/api/v1/workflows`, {
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY!,
      'Accept': 'application/json',
    },
  });

  if (!listResponse.ok) {
    console.error('❌ Failed to list workflows:', await listResponse.text());
    process.exit(1);
  }

  const workflows = await listResponse.json();
  const workflow = workflows.data?.find((w: any) => w.name === workflowName);

  if (!workflow) {
    console.error(`❌ Workflow "${workflowName}" not found`);
    console.log('\n📋 Available workflows:');
    workflows.data?.forEach((w: any) => {
      console.log(`   - ${w.name} (ID: ${w.id})`);
    });
    process.exit(1);
  }

  console.log(`✅ Found workflow: ${workflow.name} (ID: ${workflow.id})`);

  // Step 2: Execute workflow
  const executeResponse = await fetch(
    `${N8N_INSTANCE_URL}/api/v1/workflows/${workflow.id}/execute`,
    {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );

  if (!executeResponse.ok) {
    console.error('❌ Failed to execute workflow:', await executeResponse.text());
    process.exit(1);
  }

  const execution = await executeResponse.json();
  console.log(`\n✅ Workflow execution started!`);
  console.log(`   Execution ID: ${execution.data?.executionId || 'N/A'}`);
  console.log(`\n🔍 View execution:`);
  console.log(`   ${N8N_INSTANCE_URL}/executions`);
}

// Get workflow name from command line or default to Auto-Scheduler
const workflowName = process.argv[2] || 'Repurpose Auto-Scheduler';

triggerWorkflow(workflowName);
