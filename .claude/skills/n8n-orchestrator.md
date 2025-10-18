---
name: n8n-orchestrator
description: Enterprise-grade n8n workflow lifecycle management - create, secure, monitor, and optimize automation workflows with version control, security audits, and team management
keywords:
  - n8n
  - workflow
  - automation
  - orchestration
  - credential management
  - security audit
  - project management
  - execution monitoring
  - tagging
  - version control
  - source control
  - compliance
  - MFA
  - user management
  - bulk operations
when_to_use:
  - Creating or deploying n8n workflows
  - Managing n8n credentials and secrets
  - Auditing workflow security and compliance
  - Organizing workflows with projects and tags
  - Monitoring workflow execution and performance
  - Managing team access and permissions
  - Rotating credentials and enforcing MFA
  - Performing bulk workflow operations
  - Migrating workflows between environments
  - Generating security audit reports
complexity: high
auto_invoke: true
priority: high
---

# n8n Workflow Orchestrator - Claude Skill

## Purpose
Enterprise-grade n8n workflow lifecycle management that treats automation infrastructure as code with proper governance, security, and operational excellence.

## Capabilities

### 🚀 Workflow Lifecycle Management
- **Create & Deploy**: Initialize workflows, configure, activate with error handling
- **Version Control**: Pull from source control, track modifications, sync changes
- **Move & Organize**: Transfer between projects, apply tagging strategies
- **Monitor & Optimize**: Track executions, retry failures, analyze performance

### 🔐 Security & Compliance
- **Credential Management**: Create, rotate, securely manage credentials
- **Security Audits**: Generate compliance reports, identify vulnerabilities, enforce MFA
- **Access Control**: Manage user roles, permissions, team access patterns

### 📁 Project & Team Management
- **Project Operations**: Create structures, organize by environment (dev/staging/prod)
- **Team Coordination**: Manage users, assign roles, enforce policies
- **Variable Management**: Handle environment-specific configurations

### 📊 Operations & Analytics
- **Execution Management**: Monitor runs, troubleshoot failures, bulk operations
- **Tagging Strategy**: Implement taxonomy, track workflow categories
- **Bulk Operations**: Mass updates, migrations, cleanup tasks

## MCP Tools Available

This skill uses the n8n MCP server which provides:

1. **Node Documentation**: `tools_documentation`, `list_nodes`, `get_node_info`, `search_nodes`, `get_node_essentials`
2. **Template Discovery**: `list_templates`, `search_templates`, `get_template`, `search_templates_by_metadata`
3. **Validation**: `validate_workflow`, `validate_workflow_connections`, `validate_workflow_expressions`, `validate_node_operation`
4. **Dependencies**: `get_property_dependencies`, `get_node_as_tool_info`

## Workflow Audit Checklist

When auditing workflows, check:

### ✅ Security
- [ ] No hardcoded credentials (use credential references)
- [ ] Sensitive data masked in logs
- [ ] Error handling doesn't expose secrets
- [ ] Rate limiting configured for API calls
- [ ] Retry logic uses exponential backoff

### ✅ Structure
- [ ] All connections valid (no orphaned nodes)
- [ ] No circular dependencies
- [ ] Proper trigger configuration
- [ ] Error branches implemented
- [ ] Node naming is descriptive

### ✅ Expressions
- [ ] All expressions have valid syntax
- [ ] Referenced nodes exist
- [ ] Variables properly scoped
- [ ] No undefined references

### ✅ Best Practices
- [ ] Workflows tagged appropriately
- [ ] Environment variables used (not hardcoded URLs)
- [ ] Credentials properly assigned
- [ ] Error notifications configured
- [ ] Execution history retention configured

## Example Workflows

### Security Audit
```
1. Generate security audit report
2. Check credential age and rotation schedule
3. Identify workflows with missing error handling
4. Verify MFA enabled for admin users
5. Recommend improvements
```

### Workflow Validation
```
1. Validate workflow structure and connections
2. Check all expressions for syntax errors
3. Verify node configurations complete
4. Ensure credentials assigned to all nodes
5. Generate compliance report
```

### Deployment Pipeline
```
1. Pull latest from source control
2. Validate workflow before deployment
3. Tag with environment (dev/prod)
4. Move to appropriate project
5. Activate with monitoring
```

## Configuration

Requires n8n MCP server configured in Claude Code:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@n8n/mcp-server"],
      "env": {
        "N8N_API_KEY": "your-api-key",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

## API Permissions Required

All operations require appropriate n8n API permissions:
- Credentials (create, delete, move)
- Projects (create, delete, list, update)
- Security Audits (generate)
- Source Control (pull)
- Tags (CRUD operations)
- Users (management including MFA)
- Variables (CRUD operations)
- Workflows (full lifecycle including activation)
- Executions (delete, read, retry, list)

## Use Cases

1. **Environment Promotion**: Dev → Staging → Prod with automated testing
2. **Security Compliance**: Regular audits, credential rotation, access reviews
3. **Team Onboarding**: Automated project setup, credential provisioning
4. **Workflow Optimization**: Execution analysis, performance tracking, failure recovery
5. **Mass Operations**: Bulk tagging, project migrations, cleanup tasks
6. **Disaster Recovery**: Backup workflows, credential management, quick restoration

## Best Practices Enforced

- ✅ Always pull from source control before changes
- ✅ Tag workflows by team, environment, criticality
- ✅ Rotate credentials on schedule
- ✅ Monitor execution patterns for anomalies
- ✅ Use project structure for environment separation
- ✅ Regular security audits
- ✅ MFA enforcement for sensitive operations
- ✅ Clean up unused resources
- ✅ Environment variables over hardcoded values
- ✅ Descriptive naming conventions
- ✅ Error handling on all workflows
- ✅ Rate limiting for external APIs

## Integration with Repurpose AI

When working with Repurpose AI workflows:

1. **Tag Strategy**:
   - `repurpose-ai` - All Repurpose workflows
   - `phase-1` / `phase-2` / `phase-3` - Implementation phase
   - `scheduling` / `content` / `engagement` / `analytics` - Functional area
   - `active` / `testing` / `deprecated` - Lifecycle status

2. **Environment Variables**:
   - `NEXT_PUBLIC_APP_URL` - Repurpose API base URL
   - `SLACK_WEBHOOK_URL` - Alert notifications
   - Supabase, OpenAI keys via credentials (not env vars)

3. **Security Requirements**:
   - OAuth credentials for Twitter/LinkedIn
   - Service role keys for Supabase (never anon keys)
   - OpenAI API keys with rate limiting
   - Webhook signatures validated

4. **Monitoring**:
   - Track execution success rate
   - Monitor API rate limits
   - Alert on compliance violations
   - Weekly performance reports

---

**Auto-invoke**: This skill automatically activates when any n8n operation is requested.
