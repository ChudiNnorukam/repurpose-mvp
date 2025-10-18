# Security Automation - Quick Deployment Guide

**Status**: ✅ All files ready  
**Time Required**: 15 minutes  
**Date**: October 17, 2025

---

## ✅ What's Ready

All files have been created and are ready to deploy:

1. **Full workflow YAML** → `/tmp/security-validation-tuned.yml` (661 lines)
2. **Sample secrets baseline** → `.secrets.baseline` (needs real scan)
3. **PR template** → `.github/pull_request_template.md` ✅
4. **Team announcement** → `.claude/SECURITY-AUTOMATION-ANNOUNCEMENT.md` ✅
5. **Onboarding guide** → `.claude/SECURITY-ONBOARDING.md` ✅
6. **DOMPurify guide** → `.claude/DOMPURIFY-INTEGRATION.md` ✅
7. **Implementation summary** → `SECURITY-VALIDATION-IMPLEMENTATION.md` ✅

---

## 🚀 Deployment Steps (15 min)

### Step 1: Add Workflow File (2 min)

```bash
# Copy workflow from temp to .github/workflows/
cp /tmp/security-validation-tuned.yml .github/workflows/

# Verify
ls -lh .github/workflows/security-validation-tuned.yml

# Commit
git add .github/workflows/security-validation-tuned.yml
git commit -m "feat: Add tuned security validation workflow (v3.2)

- Staged checks: PR quick (3min) + nightly full (10-20min)
- dorny/paths-filter for changed-file detection
- Production build for axe accessibility scans
- detect-secrets baseline workflow
- npm audit fails only on HIGH/CRITICAL for changed deps
- CodeQL security-quick (PR) vs security-extended (main)
- Timeouts + artifact uploads for all scans
- Human review gate for auth file changes

Ref: SECURITY-VALIDATION-IMPLEMENTATION.md"
```

### Step 2: Create Real Secrets Baseline (5 min)

```bash
# Install detect-secrets
pip install detect-secrets

# Generate baseline from your actual codebase
detect-secrets scan --all-files \
  --exclude-files '\.git/.*' \
  --exclude-files 'package-lock\.json' \
  --exclude-files 'node_modules/.*' \
  --exclude-files '\.secrets\.baseline' > .secrets.baseline

# Triage findings interactively
detect-secrets audit .secrets.baseline
# Press 'n' for false positives (UUIDs, test data)
# Press 'y' for real secrets (investigate!)

# Commit
git add .secrets.baseline
git commit -m "chore: Add detect-secrets baseline"
```

### Step 3: Verify GitHub Secrets (2 min)

```bash
# Open GitHub repo settings
open "https://github.com/YOUR_ORG/repurpose/settings/secrets/actions"

# Ensure these secrets exist:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY

# If missing, add them now
```

### Step 4: Commit All Files (3 min)

```bash
# PR template already committed in Step 1, but verify:
git add .github/pull_request_template.md
git add .claude/SECURITY-ONBOARDING.md
git add .claude/SECURITY-AUTOMATION-ANNOUNCEMENT.md
git add .claude/DOMPURIFY-INTEGRATION.md
git add SECURITY-VALIDATION-IMPLEMENTATION.md

git commit -m "docs: Add security automation documentation

- Onboarding guide for security team
- Team announcement for rollout
- DOMPurify XSS prevention guide
- Implementation summary with deployment steps
- PR template with security checklist"

# Push
git push origin main
```

### Step 5: Enable Branch Protection (3 min)

```bash
# Open branch protection settings
open "https://github.com/YOUR_ORG/repurpose/settings/branches"

# Click "Add rule" for "main" branch
# Check:
# - ✅ Require status checks to pass before merging
# - ✅ Select these checks:
#   - custom-security-checks
#   - dependency-audit-quick (if PR)
#   - secret-detection-quick (if PR)
#   - sast-quick (if PR)
# - ✅ Require pull request before merging
# - ✅ Require 1 approval

# Save
```

---

## 🧪 First Test (5 min)

### Trigger First Nightly Scan Manually

```bash
# GitHub → Actions → security-validation-tuned → Run workflow
open "https://github.com/YOUR_ORG/repurpose/actions/workflows/security-validation-tuned.yml"

# Click "Run workflow" → Select branch "main" → Run

# Wait ~10-15 min for completion

# Download artifacts:
# - audit-report-full-{run_number}.zip
# - secrets-baseline-{run_number}.zip
# - axe-reports-full-{run_number}.zip
```

### Review First Results

```bash
# Extract and review
unzip audit-report-full-*.zip
cat audit-report-full.json | jq '.metadata.vulnerabilities'

# Expected: Some MODERATE findings, hopefully no HIGH/CRITICAL

# Triage (see .claude/SECURITY-ONBOARDING.md for checklist)
```

---

## 📧 Announce to Team

### Option 1: Send Email

Use `.claude/SECURITY-AUTOMATION-ANNOUNCEMENT.md` as email body.

**To**: engineering@repurpose.dev  
**Subject**: 🔒 New Security Automation Going Live - Action Required  
**Attach**: 
- `.claude/SECURITY-ONBOARDING.md`
- `.github/pull_request_template.md`

### Option 2: Slack Announcement

```markdown
🔒 **Security Automation Rollout**

Starting today, automated security checks run on every PR:
- Dependency vulnerabilities (HIGH/CRITICAL block merges)
- Secret detection (API keys, tokens)
- Code security (CodeQL)
- Accessibility (WCAG AA)

**Action**: Review `.github/pull_request_template.md` before submitting PRs

**Training**:
- Wed Oct 18, 2pm: Demo (30 min, Calendar invite sent)
- Thu Oct 19, 10am: Office hours (drop-in)

**Docs**: `.claude/SECURITY-ONBOARDING.md`
**Questions**: #security channel

– Security Team
```

---

## 🎯 Week 1 Checklist

### Day 1 (Today)
- [x] Deploy workflow file
- [x] Create secrets baseline
- [x] Enable branch protection
- [ ] Run first nightly scan
- [ ] Announce to team

### Day 2-3
- [ ] Monitor first PRs with new checks
- [ ] Triage false positives
- [ ] Update baseline if needed
- [ ] Answer team questions in #security

### Day 4 (Wed)
- [ ] Host demo session (2pm, 30 min)
- [ ] Record session for async viewing

### Day 5 (Thu)
- [ ] Office hours (10am, 30 min drop-in)

### End of Week 1
- [ ] Review metrics:
  - False positive rate (target < 20%)
  - Average PR check time (target < 3 min)
  - Issues found vs baseline
- [ ] Tune thresholds if needed
- [ ] Document exceptions in `.github/SECURITY_EXCEPTIONS.md`

---

## 🔧 Troubleshooting

### Workflow fails on first run?

**Check**:
1. GitHub Secrets exist (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
2. `.secrets.baseline` committed
3. Next.js builds successfully locally (`npm run build`)

**Common fixes**:
```bash
# Missing secrets
# → Add in GitHub Settings → Secrets

# No baseline
# → Run: detect-secrets scan > .secrets.baseline && git commit

# Build error
# → Check next.config.js, ensure env vars set
```

### Too many false positives?

**Solutions**:
- **Dependencies**: Increase `AUDIT_LEVEL_PR: high` → `critical`
- **Secrets**: Triage baseline: `detect-secrets audit .secrets.baseline`
- **CodeQL**: Dismiss findings in Security tab
- **Axe**: Add `--disable rule-id` for specific rules

### Checks too slow?

**Optimizations**:
- Skip UI checks if no `.tsx` changed: Add `if: needs.detect-changes.outputs.ui_changed == 'true'`
- Reduce axe pages: Test only `/` on PR
- Cache already enabled

---

## 📊 Success Metrics (Track Weekly)

| Metric | Target | Where to Check |
|--------|--------|----------------|
| False positive rate | < 20% | `.claude/telemetry/security-events.jsonl` |
| PR check time | < 3 min | GitHub Actions → workflow runs |
| HIGH/CRITICAL vulns in prod | 0 | Nightly audit reports |
| Auth changes with researcher-expert | 100% | PR comments |
| Team onboarding completion | 90% | Survey after Week 1 |

---

## 🆘 Support

**Immediate Issues**:
- #security Slack channel
- @security-team ping
- security@repurpose.dev

**Escalation**:
| Severity | Response Time | Contact |
|----------|---------------|---------|
| CRITICAL (auth bypass, RCE) | 1h | Security lead → CTO |
| HIGH (XSS, injection) | 24h | Security team |
| MODERATE | 7d | Weekly triage |

---

## 🎉 You're Done!

Next steps:
1. Monitor first PRs with new checks
2. Triage first nightly scan results
3. Update team in #security channel
4. Schedule demo (Wed) and office hours (Thu)

Questions? See `.claude/SECURITY-ONBOARDING.md` or #security channel.

– Security Team
