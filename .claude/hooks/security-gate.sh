#!/bin/bash
#
# Security Gate Hook for Claude Code
#
# Purpose: Pre-tool validation to block writes to sensitive paths,
# detect hardcoded secrets, and log security-relevant operations.
#
# Usage: This hook is automatically invoked before Write/Edit tools.
# Configure in Claude Code settings to enable.
#

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Log file
AUDIT_LOG="/Users/chudinnorukam/Downloads/Repurpose MVP /.claude/telemetry/security-audit.log"
mkdir -p "$(dirname "$AUDIT_LOG")"

# Function to log audit events
log_audit() {
    local severity="$1"
    local message="$2"
    local file="${3:-N/A}"
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [$severity] $message | file: $file" >> "$AUDIT_LOG"
}

# Parse tool input (JSON from stdin)
TOOL_INPUT=$(cat)
TOOL_NAME=$(echo "$TOOL_INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$TOOL_INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

# Skip if not a write operation
if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]]; then
    exit 0
fi

# ===========================
# 1. BLOCK: Sensitive Paths
# ===========================

BLOCKED_PATTERNS=(
    "/.env$"
    "/.env.local$"
    "/.env.production$"
    "/secrets/"
    "/credentials"
    "/.git/"
    "/id_rsa"
    "/id_ed25519"
    "/.ssh/"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" =~ $pattern ]]; then
        echo -e "${RED}❌ SECURITY GATE: Blocked write to sensitive path${NC}" >&2
        echo -e "${RED}File: $FILE_PATH${NC}" >&2
        echo -e "${RED}Reason: Matches blocked pattern: $pattern${NC}" >&2
        echo -e "${YELLOW}Action required: Use environment variables instead${NC}" >&2
        log_audit "CRITICAL" "Blocked write to sensitive path: $pattern" "$FILE_PATH"
        exit 2
    fi
done

# ===========================
# 2. WARN: Auth File Changes
# ===========================

AUTH_PATTERNS=(
    "/middleware.ts$"
    "/lib/supabase"
    "/lib.*auth"
    "/app/api/auth/"
)

for pattern in "${AUTH_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" =~ $pattern ]]; then
        echo -e "${YELLOW}⚠️  SECURITY GATE: Auth file change detected${NC}" >&2
        echo -e "${YELLOW}File: $FILE_PATH${NC}" >&2
        echo -e "${YELLOW}Required actions:${NC}" >&2
        echo -e "${YELLOW}  1. Review .claude/skills/_shared/security-checklist.md${NC}" >&2
        echo -e "${YELLOW}  2. Invoke researcher-expert for auth pattern validation${NC}" >&2
        echo -e "${YELLOW}  3. Run security validation: npm audit && npm run test:security${NC}" >&2
        log_audit "HIGH" "Auth file modification warning" "$FILE_PATH"
        # Don't block, just warn
        break
    fi
done

# ===========================
# 3. DETECT: Hardcoded Secrets
# ===========================

SECRET_PATTERNS=(
    'sk-proj-[A-Za-z0-9]{40,}'           # OpenAI keys
    'AKIA[0-9A-Z]{16}'                   # AWS access keys
    'ghp_[0-9a-zA-Z]{36}'                # GitHub tokens
    'secret\s*=\s*['\''"][^'\''"]{20,}'  # Generic secrets
    'password\s*=\s*['\''"][^'\''"]{8,}' # Passwords
    'api[_-]?key\s*=\s*['\''"][^'\''"]{16,}' # API keys
)

if [[ -n "$CONTENT" ]]; then
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if echo "$CONTENT" | grep -qE "$pattern"; then
            echo -e "${RED}❌ SECURITY GATE: Hardcoded secret detected${NC}" >&2
            echo -e "${RED}File: $FILE_PATH${NC}" >&2
            echo -e "${RED}Pattern: $pattern${NC}" >&2
            echo -e "${YELLOW}Action required: Use environment variables${NC}" >&2
            echo -e "${YELLOW}Example: process.env.OPENAI_API_KEY${NC}" >&2
            log_audit "CRITICAL" "Hardcoded secret detected: $pattern" "$FILE_PATH"
            exit 2
        fi
    done
fi

# ===========================
# 4. LOG: Dependency Changes
# ===========================

if [[ "$FILE_PATH" =~ package\.json$ ]] || [[ "$FILE_PATH" =~ package-lock\.json$ ]]; then
    echo -e "${YELLOW}⚠️  SECURITY GATE: Dependency change detected${NC}" >&2
    echo -e "${YELLOW}File: $FILE_PATH${NC}" >&2
    echo -e "${YELLOW}Required actions:${NC}" >&2
    echo -e "${YELLOW}  1. Run: npm audit${NC}" >&2
    echo -e "${YELLOW}  2. Check license compliance: npx license-checker${NC}" >&2
    echo -e "${YELLOW}  3. Review OWASP A5/A7 checklist${NC}" >&2
    log_audit "HIGH" "Dependency modification" "$FILE_PATH"
fi

# ===========================
# 5. LOG: Config Changes
# ===========================

CONFIG_PATTERNS=(
    "next.config"
    "vercel.json"
    "tsconfig.json"
    ".github/workflows"
)

for pattern in "${CONFIG_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" =~ $pattern ]]; then
        echo -e "${YELLOW}ℹ️  SECURITY GATE: Config file change${NC}" >&2
        echo -e "${YELLOW}File: $FILE_PATH${NC}" >&2
        echo -e "${YELLOW}Reminder: Verify security headers, CORS, CSP${NC}" >&2
        log_audit "MEDIUM" "Configuration file modification" "$FILE_PATH"
        break
    fi
done

# ===========================
# 6. AUDIT: All Write Operations
# ===========================

log_audit "INFO" "Write operation approved" "$FILE_PATH"

echo -e "${GREEN}✅ Security gate passed${NC}" >&2
exit 0
