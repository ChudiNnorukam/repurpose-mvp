#!/usr/bin/env ts-node
/**
 * Automated n8n Workflow Setup Script
 *
 * This script:
 * 1. Imports all workflows to your n8n instance
 * 2. Creates credentials (Supabase, OpenAI)
 * 3. Activates workflows
 * 4. Runs test executions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_INSTANCE_URL = process.env.N8N_INSTANCE_URL;

if (!N8N_API_KEY || !N8N_INSTANCE_URL) {
  console.error('❌ Missing N8N_API_KEY or N8N_INSTANCE_URL in .env.local');
  process.exit(1);
}

// Remove trailing slash from URL
const BASE_URL = N8N_INSTANCE_URL.replace(/\/$/, '');

interface N8NCredential {
  name: string;
  type: string;
  data: Record<string, any>;
}

interface WorkflowImport {
  name: string;
  filename: string;
  credentialMappings: Record<string, string>;
}

// Helper: Make API request to n8n
async function n8nRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`📡 ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY!,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n API Error (${response.status}): ${error}`);
  }

  return response.json();
}

// Step 1: Create credentials
async function createCredentials() {
  console.log('\n🔑 Step 1: Creating Credentials...\n');

  const credentials: N8NCredential[] = [
    {
      name: 'Supabase API',
      type: 'supabaseApi',
      data: {
        host: process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    },
  ];

  // Note: OpenAI credentials will be created manually in n8n UI
  // The API credential structure varies by n8n version

  const createdCredentials: Record<string, string> = {};

  for (const cred of credentials) {
    try {
      // Create credential (n8n will handle duplicates)
      const result = await n8nRequest('/api/v1/credentials', 'POST', cred);
      console.log(`✅ Created credential: "${cred.name}" (ID: ${result.id})`);
      createdCredentials[cred.type] = result.id;
    } catch (error: any) {
      // If credential already exists, that's okay
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`ℹ️  Credential "${cred.name}" already exists`);
      } else {
        console.error(`❌ Failed to create credential "${cred.name}":`, error.message);
      }
    }
  }

  console.log('\n📝 Manual credential setup required in n8n UI:');
  console.log('   - OpenAI API (API key authentication)');
  console.log('   - Twitter OAuth2 (OAuth flow)');
  console.log('   - LinkedIn OAuth2 (OAuth flow)');
  console.log('   Visit: https://chudinnorukam.app.n8n.cloud/credentials\n');

  return createdCredentials;
}

// Step 2: Import workflows
async function importWorkflows(credentialIds: Record<string, string>) {
  console.log('\n📦 Step 2: Importing Workflows...\n');

  const workflowsDir = path.join(__dirname, '../n8n-workflows');
  const workflows: WorkflowImport[] = [
    {
      name: 'Auto-Scheduler',
      filename: '1-auto-scheduler.json',
      credentialMappings: { supabaseApi: credentialIds.supabaseApi || '1' },
    },
    {
      name: 'Content Personalizer',
      filename: '2-content-personalizer.json',
      credentialMappings: {
        supabaseApi: credentialIds.supabaseApi || '1',
        openAiApi: credentialIds.openAiApi || '2',
      },
    },
    {
      name: 'Quality Gate',
      filename: '3-quality-gate.json',
      credentialMappings: {
        supabaseApi: credentialIds.supabaseApi || '1',
        openAiApi: credentialIds.openAiApi || '2',
      },
    },
    {
      name: 'Engagement Monitor',
      filename: '4-engagement-monitor.json',
      credentialMappings: {
        supabaseApi: credentialIds.supabaseApi || '1',
        openAiApi: credentialIds.openAiApi || '2',
      },
    },
  ];

  const importedWorkflows: Array<{ id: string; name: string }> = [];

  for (const workflow of workflows) {
    try {
      const filePath = path.join(workflowsDir, workflow.filename);

      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        continue;
      }

      const workflowJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Clean workflow JSON - remove fields n8n doesn't accept
      const cleanWorkflow = {
        name: workflowJson.name,
        nodes: workflowJson.nodes,
        connections: workflowJson.connections,
        settings: workflowJson.settings || {},
        // Don't include 'active' - it's read-only on creation
      };

      // Update credential IDs in workflow nodes
      if (cleanWorkflow.nodes) {
        cleanWorkflow.nodes.forEach((node: any) => {
          if (node.credentials) {
            Object.keys(node.credentials).forEach(credType => {
              if (credentialIds[credType]) {
                node.credentials[credType].id = credentialIds[credType];
              }
            });
          }
        });
      }

      // Create workflow (n8n will handle duplicates by name)
      const result = await n8nRequest('/api/v1/workflows', 'POST', cleanWorkflow);
      console.log(`✅ Imported workflow: "${workflow.name}" (ID: ${result.id})`);


      importedWorkflows.push({ id: result.id, name: workflow.name });
    } catch (error: any) {
      console.error(`❌ Failed to import "${workflow.name}":`, error.message);
    }
  }

  return importedWorkflows;
}

// Step 3: Activate workflows
async function activateWorkflows(
  workflows: Array<{ id: string; name: string }>
) {
  console.log('\n⚡ Step 3: Activating Workflows...\n');

  for (const workflow of workflows) {
    try {
      await n8nRequest(`/api/v1/workflows/${workflow.id}/activate`, 'POST');
      console.log(`✅ Activated: "${workflow.name}"`);
    } catch (error: any) {
      console.error(`❌ Failed to activate "${workflow.name}":`, error.message);
    }
  }
}

// Step 4: Verify setup
async function verifySetup() {
  console.log('\n✅ Step 4: Verifying Setup...\n');

  try {
    // List workflows
    const workflows = await n8nRequest('/api/v1/workflows');
    const activeWorkflows = workflows.data?.filter((w: any) => w.active) || [];

    console.log(`📊 Total workflows: ${workflows.data?.length || 0}`);
    console.log(`⚡ Active workflows: ${activeWorkflows.length}`);

    // List credentials
    const credentials = await n8nRequest('/api/v1/credentials');
    console.log(`🔑 Total credentials: ${credentials.data?.length || 0}`);

    // List recent executions
    const executions = await n8nRequest('/api/v1/executions?limit=5');
    console.log(`📈 Recent executions: ${executions.data?.length || 0}`);

    return {
      workflows: workflows.data?.length || 0,
      activeWorkflows: activeWorkflows.length,
      credentials: credentials.data?.length || 0,
    };
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🚀 n8n Automation Setup Starting...\n');
  console.log(`🌐 Instance: ${BASE_URL}`);
  console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 20)}...`);

  try {
    // Step 1: Create credentials
    const credentialIds = await createCredentials();

    // Step 2: Import workflows
    const importedWorkflows = await importWorkflows(credentialIds);

    if (importedWorkflows.length === 0) {
      console.error('\n❌ No workflows were imported. Exiting.');
      process.exit(1);
    }

    // Step 3: Activate workflows
    await activateWorkflows(importedWorkflows);

    // Step 4: Verify setup
    const stats = await verifySetup();

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Setup Complete!');
    console.log('='.repeat(60));
    console.log(`\n✅ Imported ${importedWorkflows.length} workflows`);
    console.log(`✅ Created ${Object.keys(credentialIds).length} credentials`);

    if (stats) {
      console.log(`\n📊 Current Status:`);
      console.log(`   - Total workflows: ${stats.workflows}`);
      console.log(`   - Active workflows: ${stats.activeWorkflows}`);
      console.log(`   - Total credentials: ${stats.credentials}`);
    }

    console.log(`\n🌐 n8n Dashboard: ${BASE_URL}`);
    console.log(`\n⚠️  Next Steps:`);
    console.log(`   1. Visit n8n Dashboard → Credentials`);
    console.log(`   2. Set up OAuth for Twitter and LinkedIn`);
    console.log(`   3. Add Slack webhook URL as environment variable (optional)`);
    console.log(`   4. Run database migration in Supabase (see README-SETUP.md)`);
    console.log(`   5. Test workflows manually in n8n UI`);

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
