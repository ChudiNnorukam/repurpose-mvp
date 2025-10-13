# Playwright-Linear MCP Integration Setup

This guide will help you set up the Playwright-Linear integration for automated test tracking and iterative improvement.

## What This Does

The Playwright-Linear integration:

1. **Runs Playwright Tests** - Executes your end-to-end tests
2. **Tracks Results** - Captures pass/fail status, errors, and timing
3. **Creates Linear Issues** - Automatically creates issues for failed tests
4. **Generates Reports** - Creates detailed JSON and Markdown reports
5. **Iterative Improvement** - Runs multiple test cycles to track improvements

## Prerequisites

- ✅ Playwright is installed (`@playwright/test`)
- ✅ Linear MCP server is installed
- ⚠️ Linear API key is required

## Setup Steps

### 1. Get Your Linear API Key

1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Click "Create new API key"
3. Give it a name like "Repurpose MVP Testing"
4. Copy the key

### 2. Configure Environment

Add your Linear API key to your environment:

```bash
# Option 1: Add to .env.local (recommended)
echo "LINEAR_API_KEY=your_api_key_here" >> repurpose/.env.local

# Option 2: Export in your shell session
export LINEAR_API_KEY="your_api_key_here"
```

### 3. Create Linear Project (Optional)

You can either:
- Use an existing Linear project
- Create a new one at [Linear](https://linear.app)

Set the project name:
```bash
export LINEAR_PROJECT="Repurpose MVP"
```

## Usage

### Run Single Test Iteration

```bash
cd repurpose
npm run test:linear
```

This will:
1. Run all Playwright tests
2. Generate a test report
3. Create Linear issues for failures (if configured)

### Run Multiple Iterations

For recursive testing and improvement:

```bash
cd repurpose
npm run test:linear:iterate
```

This will:
1. Run up to 5 iterations of tests
2. Track improvements between iterations
3. Stop early if all tests pass
4. Generate comprehensive reports

Configure iterations:
```bash
MAX_ITERATIONS=10 npm run test:linear:iterate
```

### Run Tests Only (No Linear)

```bash
cd repurpose
npm run test:e2e           # Run tests
npm run test:e2e:ui        # Run tests with UI
```

## Reports

Reports are saved to: `repurpose/test-results/linear-integration/`

### Report Files

- `iteration-N-report.json` - Detailed JSON report
- `iteration-N-report.md` - Human-readable Markdown summary
- `test-output-*.json` - Raw Playwright output

### Sample Report Structure

```json
{
  "iteration": 1,
  "timestamp": "2025-10-11T12:00:00Z",
  "summary": {
    "total": 5,
    "passed": 4,
    "failed": 1,
    "skipped": 0,
    "passRate": 80
  },
  "testResults": [...],
  "linearIssues": [...],
  "recommendations": [...]
}
```

## Integration with Linear

### Current Implementation

The integration script includes:

✅ Test execution and result parsing
✅ Report generation (JSON + Markdown)
✅ Issue description templates
✅ Recursive iteration support
⏳ Linear issue creation (requires MCP tools)

### Linear MCP Tools (To Be Implemented)

To fully integrate with Linear, you'll need to use the Linear MCP tools:

```typescript
// Example: Create issue via MCP
// This will be implemented when Linear MCP is fully configured

const issue = await linearMCP.createIssue({
  teamId: "YOUR_TEAM_ID",
  title: "[Test Failure] Login test fails",
  description: "Test failed with error: ...",
  priority: 2,
  labels: ["testing", "automation"]
});
```

## Existing Tests

Current Playwright tests in `tests/`:

1. `hero.spec.ts` - Homepage hero section tests
2. `check-auth.spec.ts` - Authentication flow tests
3. `schedule-debug.spec.ts` - Schedule functionality tests
4. `schedule-with-login.spec.ts` - Authenticated schedule tests
5. `capture-schedule-error.spec.ts` - Error handling tests

## Workflow Example

### Typical Development Flow

1. **Make code changes** to fix bugs or add features
2. **Run integration**: `npm run test:linear:iterate`
3. **Review reports** in `test-results/linear-integration/`
4. **Check Linear issues** for failures
5. **Fix failing tests**
6. **Repeat** until all tests pass

### Example Session

```bash
# Start integration
$ npm run test:linear:iterate

🚀 Starting Playwright-Linear Integration...
Project: Repurpose MVP
Iteration: 1

📋 Running Playwright tests...
✓ Tests completed

📊 Parsing test results...
✓ Parsed 5 test results
  - Passed: 3
  - Failed: 2
  - Skipped: 0

🔄 Syncing with Linear...
  - Creating issue: [Test Failure] Login redirects to dashboard
    ✓ Created: REP-123

📄 Generating improvement report...
✓ Report saved to: test-results/linear-integration/iteration-1-report.json
✓ Markdown report saved to: test-results/linear-integration/iteration-1-report.md

✅ Integration completed successfully!

Iteration 1 Results:
  Pass Rate: 60%
  Failed Tests: 2

Waiting 5 seconds before next iteration...
```

## Troubleshooting

### Linear MCP Not Connected

```
Error: Linear MCP server not connected
```

**Solution**: Restart Claude Code or check MCP configuration:
```bash
claude mcp list
```

### No Linear API Key

```
⚠️  LINEAR_API_KEY not set
```

**Solution**: Add your API key to `.env.local` or export it in your shell.

### Tests Failing

Check the detailed error messages in the report files:

```bash
# View latest report
cat repurpose/test-results/linear-integration/iteration-*-report.md | tail -100
```

### Port Already in Use

If dev server fails to start:

```bash
# Kill existing processes
pkill -f "next dev"
```

## Advanced Configuration

### Custom Test Patterns

Modify `playwright.config.ts` to run specific tests:

```typescript
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',  // Customize pattern
  // ...
})
```

### Custom Report Location

```bash
# In scripts/playwright-linear-integration.ts
const config = {
  reportDir: '/custom/path/to/reports'
};
```

## Next Steps

1. ✅ Integration script is ready
2. ⏳ Get Linear API key
3. ⏳ Run first test iteration
4. ⏳ Review and fix failing tests
5. ⏳ Iterate until 100% pass rate

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Linear API Documentation](https://developers.linear.app)
- [Linear MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/linear)

## Support

For issues or questions:
- Check test reports in `test-results/linear-integration/`
- Review Playwright logs
- Check Linear issues created by the integration

---

**Generated for Repurpose MVP** - Automated Testing with Linear Integration
