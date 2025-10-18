# Security Automation Onboarding & Triage Guide

**Version**: 1.0  
**Purpose**: First-week setup & ongoing triage for automated security validation

## Quick Start (15 min) - Week 1 Grace Period

**Goal**: Establish baselines, tune thresholds, avoid blocking developers

### 1. Create detect-secrets baseline
```bash
pip install detect-secrets
detect-secrets scan --all-files \
  --exclude-files '\.git/.*' \
  --exclude-files 'package-lock\.json' \
  --exclude-files 'node_modules/.*' > .secrets.baseline

# Triage findings
detect-secrets audit .secrets.baseline

# Commit
git add .secrets.baseline
git commit -m "chore: Add detect-secrets baseline"
```

### 2. Run first nightly scan (manual trigger or wait for 2 AM UTC)
- Check GitHub Actions → security-validation-tuned workflow
- Download artifacts: audit-report-full, secrets-baseline, axe-reports-full

### 3. Triage first-week noise
- Review `audit-report-full.json` - focus on CRITICAL/HIGH only
- Review `.secrets.baseline` - mark false positives
- Review `axe-reports-full` - file UX issues for WCAG AA failures

### 4. Enable blocking after 1 week
- Remove `continue-on-error: true` if any soft-enabled
- Document exceptions in `.github/SECURITY_EXCEPTIONS.md`

---

## Daily Triage (5 min) - PR Reviews

- [ ] Check PR security summary (auto-posted)
  - Auth file changes → manual review required
  - New HIGH/CRITICAL in deps → block merge
  - Axe failures → review with UX

- [ ] Review GitHub Security tab
  - CodeQL findings → triage as bug/false-positive
  - Dependabot → accept/dismiss/snooze

---

## Weekly Triage (30 min) - Monday Mornings

- [ ] Download nightly artifacts (Actions → Artifacts)
- [ ] Compare audit-report-full vs last week
- [ ] Update `.secrets.baseline` if drift detected
  ```bash
  detect-secrets audit .secrets.baseline.new
  # Mark false positives, commit
  ```
- [ ] Triage HIGH/CRITICAL dependencies
  ```bash
  jq -r '.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high") | "\(.key): \(.value.severity)"' audit-report-full.json
  ```
- [ ] Review accessibility regressions (axe-reports-full)

---

## Common False Positives & Fixes

### 1. detect-secrets: UUIDs, test data flagged

**Fix**:
```bash
detect-secrets audit .secrets.baseline
# Press 'n' for false positives, 'y' for real secrets
git add .secrets.baseline && git commit -m "chore: Update baseline"
```

### 2. npm audit: Moderate noise in dev deps

**Already filtered**: PR checks only fail on HIGH/CRITICAL
**Action**: Review moderate quarterly, not weekly

### 3. axe: Color contrast false positives

**Already disabled**: `--disable color-contrast` in workflow
**Manual check**: Use Lighthouse CI if needed

### 4. CodeQL: Unused variables (quality, not security)

**Fix**: Filter to `security-*` queries (already done)
**Action**: Dismiss "Maintenance" findings in Security tab

### 5. TruffleHog: Base64/hashes flagged

**Already filtered**: `--only-verified` reduces noise
**Action**: Review unverified manually, add to ignore file

---

## Incident Response: Secret Leaked

**If secret detected in git history**:

1. **Rotate immediately** (e.g., OpenAI dashboard → revoke → new key → Vercel env vars)
2. **Purge from history** (destructive!)
   ```bash
   brew install bfg
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```
3. **Verify removal**
   ```bash
   docker run --rm -v "$PWD:/repo" trufflesecurity/trufflehog:latest git file:///repo --only-verified
   ```
4. **Post-mortem**: Document in `.claude/telemetry/security-incidents.md`

---

## Metrics & Reporting

**Weekly Scorecard** (from `.claude/telemetry/security-events.jsonl`):
- Vulnerability response time (target: 7d for HIGH, 24h for CRITICAL)
- Secret detection coverage (target: 100%)
- Accessibility score (target: 90% WCAG AA)
- False positive rate (target: <20%)

**Monthly Report Template**:
```markdown
## Security Report - October 2025
- 🔴 Critical: 0 ✅
- 🟡 High: 2 ⚠️ (target <5)
- 🔑 Secrets: 0 ✅
- ♿ A11y: 88% ⚠️ (target 90%)

**Top Findings**:
1. HIGH: next CVE-2025-XXXX → upgrade to 15.5.5 ✅
2. A11y: /dashboard ARIA labels → UX issue #456 ⏳
```

---

## Training Resources

**For Developers** (paste in PR template):
```markdown
### Security Checklist
- [ ] No hardcoded secrets (`grep -r "sk-" .`)
- [ ] Auth changes reviewed
- [ ] Consulted `.claude/skills/_shared/security-checklist.md`
- [ ] Invoked researcher-expert for OAuth/crypto
```

**For Security Team**:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [RFC 7636 PKCE](https://tools.ietf.org/html/rfc7636)
- [CodeQL Docs](https://codeql.github.com/docs/)
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/?levels=aa)

**Internal**:
- `.claude/skills/researcher-expert/SKILL.md`
- `.claude/skills/_shared/security-checklist.md`
- `.github/workflows/security-validation-tuned.yml`

---

## FAQ

**Q: Why PR quick + main full?**  
A: Developer velocity (3 min PR checks catch 80%, 10-20 min nightly catches 20%)

**Q: Urgent PR but checks failing?**  
A: Never bypass auth/secrets/HIGH vulns. Acceptable bypasses (with approval): moderate transitive deps, a11y warnings. Add `[security-override]` to commit + link approval issue.

**Q: Run locally?**  
A: Quick: `npm audit --audit-level=high && detect-secrets scan --baseline .secrets.baseline`  
Full: `act -j dependency-audit-full` (GitHub Act)

**Q: Who gets notified?**  
A: PR: author + reviewers | Main: CODEOWNERS + #security | Critical: Slack + PagerDuty

---

## Escalation

| Severity | Response | Path |
|----------|----------|------|
| CRITICAL (auth bypass, RCE, leak) | 1h | Security lead → CTO |
| HIGH (XSS, injection) | 24h | Security team → Eng lead |
| MODERATE (non-exploitable CVE) | 7d | Weekly triage |
| LOW (quality, license) | 30d | Monthly review |

**Contact**: #security, security@repurpose.dev

---

**Next Steps**:
1. Complete Week 1 setup (15 min)
2. Schedule weekly triage (30 min/week)
3. Run first nightly scan
4. Document exceptions in `.github/SECURITY_EXCEPTIONS.md`
