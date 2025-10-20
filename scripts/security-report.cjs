#!/usr/bin/env node
/**
 * Security Report Generator
 * 
 * Analyzes security telemetry logs and generates weekly metrics report.
 * 
 * Usage:
 *   node scripts/security-report.js [--days=7] [--format=markdown|json]
 * 
 * Outputs:
 *   - Total security triggers
 *   - Research invocation rate
 *   - Human reviews required
 *   - Breakdown by OWASP category
 *   - Breakdown by severity
 *   - Alerts for high rates or critical events
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TELEMETRY_DIR = path.join(__dirname, '../.claude/telemetry');
const EVENTS_FILE = path.join(TELEMETRY_DIR, 'security-events.jsonl');
const AUDIT_FILE = path.join(TELEMETRY_DIR, 'security-audit.log');
const REVIEW_QUEUE = path.join(TELEMETRY_DIR, 'review-queue.txt');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value || true;
  return acc;
}, {});

const DAYS = parseInt(args.days || 7);
const FORMAT = args.format || 'markdown';

/**
 * Parse JSONL file and filter by date range
 */
function parseEvents() {
  if (!fs.existsSync(EVENTS_FILE)) {
    return [];
  }

  const content = fs.readFileSync(EVENTS_FILE, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS);

  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return null;
    }
  })
  .filter(event => event && new Date(event.timestamp) >= cutoffDate);
}

/**
 * Parse audit log and filter by date range
 */
function parseAuditLog() {
  if (!fs.existsSync(AUDIT_FILE)) {
    return [];
  }

  const content = fs.readFileSync(AUDIT_FILE, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS);

  return lines.map(line => {
    const match = line.match(/\[(.*?)\] \[(.*?)\] (.*?) \| file: (.*)/);
    if (!match) return null;
    
    const [, timestamp, severity, message, file] = match;
    const date = new Date(timestamp);
    
    if (date < cutoffDate) return null;
    
    return { timestamp: date.toISOString(), severity, message, file };
  }).filter(Boolean);
}

/**
 * Calculate metrics from events
 */
function calculateMetrics(events, auditLogs) {
  const metrics = {
    totalEvents: events.length,
    totalAuditLogs: auditLogs.length,
    securityTriggers: 0,
    researchInvocations: 0,
    humanReviewsRequired: 0,
    hookBlocks: 0,
    hookWarnings: 0,
    byOWASP: {},
    bySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
    byAgent: {},
    criticalAlerts: [],
  };

  // Process events
  events.forEach(event => {
    if (event.event_type === 'security_trigger') {
      metrics.securityTriggers++;
    } else if (event.event_type === 'security_research') {
      metrics.researchInvocations++;
    } else if (event.event_type === 'hook_block') {
      metrics.hookBlocks++;
    } else if (event.event_type === 'hook_warn') {
      metrics.hookWarnings++;
    }

    if (event.human_review_required) {
      metrics.humanReviewsRequired++;
    }

    if (event.owasp_category) {
      metrics.byOWASP[event.owasp_category] = (metrics.byOWASP[event.owasp_category] || 0) + 1;
    }

    if (event.agent) {
      metrics.byAgent[event.agent] = (metrics.byAgent[event.agent] || 0) + 1;
    }
  });

  // Process audit logs
  auditLogs.forEach(log => {
    if (log.severity) {
      metrics.bySeverity[log.severity]++;
    }

    if (log.severity === 'CRITICAL') {
      metrics.criticalAlerts.push({
        timestamp: log.timestamp,
        message: log.message,
        file: log.file,
      });
    }
  });

  return metrics;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(metrics) {
  const report = [];
  const now = new Date();
  
  report.push(`# Security Telemetry Report`);
  report.push(``);
  report.push(`**Generated**: ${now.toISOString()}`);
  report.push(`**Period**: Last ${DAYS} days`);
  report.push(``);
  report.push(`---`);
  report.push(``);

  // Summary
  report.push(`## Summary`);
  report.push(``);
  report.push(`| Metric | Count |`);
  report.push(`|--------|-------|`);
  report.push(`| Total Events | ${metrics.totalEvents} |`);
  report.push(`| Security Triggers | ${metrics.securityTriggers} |`);
  report.push(`| Research Invocations | ${metrics.researchInvocations} |`);
  report.push(`| Human Reviews Required | ${metrics.humanReviewsRequired} |`);
  report.push(`| Hook Blocks (Prevented) | ${metrics.hookBlocks} |`);
  report.push(`| Hook Warnings | ${metrics.hookWarnings} |`);
  report.push(`| Audit Log Entries | ${metrics.totalAuditLogs} |`);
  report.push(``);

  // Research Rate
  const researchRate = metrics.securityTriggers > 0 
    ? ((metrics.researchInvocations / metrics.securityTriggers) * 100).toFixed(1)
    : 0;
  report.push(`**Research Invocation Rate**: ${researchRate}% (target: ≥80%)`);
  report.push(``);

  // OWASP Breakdown
  report.push(`## OWASP Category Breakdown`);
  report.push(``);
  report.push(`| Category | Count | Percentage |`);
  report.push(`|----------|-------|------------|`);
  
  const totalOWASP = Object.values(metrics.byOWASP).reduce((a, b) => a + b, 0);
  Object.entries(metrics.byOWASP)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const percentage = ((count / totalOWASP) * 100).toFixed(1);
      report.push(`| ${category} | ${count} | ${percentage}% |`);
    });
  
  if (totalOWASP === 0) {
    report.push(`| (none) | 0 | 0% |`);
  }
  report.push(``);

  // Severity Breakdown
  report.push(`## Severity Breakdown`);
  report.push(``);
  report.push(`| Severity | Count |`);
  report.push(`|----------|-------|`);
  report.push(`| 🔴 CRITICAL | ${metrics.bySeverity.CRITICAL} |`);
  report.push(`| 🟡 HIGH | ${metrics.bySeverity.HIGH} |`);
  report.push(`| 🟢 MEDIUM | ${metrics.bySeverity.MEDIUM} |`);
  report.push(`| ⚪ LOW | ${metrics.bySeverity.LOW} |`);
  report.push(`| ℹ️  INFO | ${metrics.bySeverity.INFO} |`);
  report.push(``);

  // Agent Breakdown
  report.push(`## Agent Activity`);
  report.push(``);
  report.push(`| Agent | Events |`);
  report.push(`|-------|--------|`);
  
  Object.entries(metrics.byAgent)
    .sort((a, b) => b[1] - a[1])
    .forEach(([agent, count]) => {
      report.push(`| ${agent} | ${count} |`);
    });
  
  if (Object.keys(metrics.byAgent).length === 0) {
    report.push(`| (none) | 0 |`);
  }
  report.push(``);

  // Critical Alerts
  if (metrics.criticalAlerts.length > 0) {
    report.push(`## 🚨 Critical Alerts`);
    report.push(``);
    metrics.criticalAlerts.forEach(alert => {
      report.push(`- **${alert.timestamp}**: ${alert.message}`);
      report.push(`  - File: \`${alert.file}\``);
    });
    report.push(``);
  }

  // Recommendations
  report.push(`## Recommendations`);
  report.push(``);
  
  if (metrics.bySeverity.CRITICAL > 0) {
    report.push(`- ⚠️  **${metrics.bySeverity.CRITICAL} critical issues detected** - Review immediately`);
  }
  
  if (researchRate < 80 && metrics.securityTriggers > 0) {
    report.push(`- ⚠️  **Research rate ${researchRate}% below target (80%)** - Agents may be skipping research`);
  }
  
  if (metrics.humanReviewsRequired > 0) {
    report.push(`- ℹ️  **${metrics.humanReviewsRequired} tasks need human review** - Check \`.claude/telemetry/review-queue.txt\``);
  }
  
  if (metrics.hookBlocks > 5) {
    report.push(`- ⚠️  **${metrics.hookBlocks} blocked operations** - Review if agents attempting risky writes`);
  }

  if (metrics.bySeverity.CRITICAL === 0 && researchRate >= 80) {
    report.push(`- ✅ **All security metrics healthy** - Continue monitoring`);
  }
  
  report.push(``);
  
  return report.join('\n');
}

/**
 * Generate JSON report
 */
function generateJSONReport(metrics) {
  return JSON.stringify({
    generated: new Date().toISOString(),
    period_days: DAYS,
    metrics,
  }, null, 2);
}

/**
 * Main execution
 */
function main() {
  console.log(`Analyzing security telemetry (last ${DAYS} days)...\n`);

  const events = parseEvents();
  const auditLogs = parseAuditLog();
  const metrics = calculateMetrics(events, auditLogs);

  const report = FORMAT === 'json' 
    ? generateJSONReport(metrics)
    : generateMarkdownReport(metrics);

  console.log(report);

  // Exit code based on critical issues
  process.exit(metrics.bySeverity.CRITICAL > 0 ? 1 : 0);
}

main();
