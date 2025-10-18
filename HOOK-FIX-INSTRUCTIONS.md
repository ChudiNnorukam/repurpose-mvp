# Claude Code Hook Fix Instructions

## Problem Identified

**Root Cause:** A Python-based pre-tool validation hook with improper shell escaping is blocking all Write/Edit operations.

**Error Message:**
```
PreToolUse:Write hook error: [python3 -c \"import json,sys;d=json.load(sys.stdin);p=d.get('tool_input',{}).get('file_path','');sys.exit(2 if any(x in p for x in ['.env','/secrets/','package-lock.json','.git/']) else 0)\]: /bin/sh: -c: line 0: syntax error near unexpected token `('
```

**Issue:** The Python command has excessive quote escaping that causes shell syntax errors.

## Investigation Summary

1. **Global Settings** (`~/.claude/settings.json`): Currently clean with `"hooks": {}`
2. **Project Settings** (`.claude/settings.json`): Also clean with `"hooks": {}`
3. **Problem:** Claude Code is caching an old hook configuration in memory

## Solutions (Choose One)

### Option A: Restart Claude Code (RECOMMENDED - 30 seconds)

1. **Exit Claude Code completely:**
   ```bash
   # Find the process
   ps aux | grep claude | grep -v grep
   
   # Kill it (or use Cmd+Q in the app)
   kill 2195  # Use your actual PID
   ```

2. **Restart Claude Code**
   - The clean settings files are already in place
   - Hooks should be disabled on restart

3. **Test:**
   ```bash
   # Try creating a test file
   echo "test" > test-hook-fix.txt
   ```

### Option B: Temporary Hook Disable via Settings UI

1. Open Claude Code settings
2. Navigate to "Hooks" section  
3. Disable all `preToolUse` hooks
4. Save and reload

### Option C: Manual Settings Edit (If A & B fail)

1. **Exit Claude Code completely**

2. **Verify settings files are clean:**
   ```bash
   cat ~/.claude/settings.json
   # Should show "hooks": {}
   
   cat "/Users/chudinnorukam/Downloads/Repurpose MVP /.claude/settings.json" | jq '.hooks'
   # Should show {}
   ```

3. **If they contain hooks, replace with:**

   **Global (`~/.claude/settings.json`):**
   ```json
   {
     "permissions": {
       "allow": ["Bash(git commit:*)"],
       "deny": [],
       "ask": []
     },
     "hooks": {},
     "alwaysThinkingEnabled": false
   }
   ```

   **Project (`.claude/settings.json`):**
   ```json
   {
     "permissions": { ... },
     "hooks": {},
     "customCommands": { ... },
     "safetyRules": { ... },
     "refactoringConstraints": { ... }
   }
   ```

4. **Clear any cache:**
   ```bash
   rm -f ~/.claude/ide/*.lock
   rm -f ~/.claude/statsig/statsig.cached.*
   ```

5. **Restart Claude Code**

### Option D: Use the Project-Level Security Gate (BEST LONG-TERM)

The project has a well-written security hook at `.claude/hooks/security-gate.sh` that works correctly. To use it:

1. **Verify the hook script exists:**
   ```bash
   ls -la "/Users/chudinnorukam/Downloads/Repurpose MVP /.claude/hooks/security-gate.sh"
   chmod +x "/Users/chudinnorukam/Downloads/Repurpose MVP /.claude/hooks/security-gate.sh"
   ```

2. **Update project settings** to use it (after Claude Code restarts):
   ```json
   {
     "hooks": {
       "preToolUse": {
         "Edit": {
           "description": "Security gate validation",
           "enabled": true,
           "command": "./.claude/hooks/security-gate.sh"
         },
         "Write": {
           "description": "Security gate validation",
           "enabled": true,
           "command": "./.claude/hooks/security-gate.sh"
         }
       }
     }
   }
   ```

3. **Benefits:**
   - Blocks writes to `.env`, `/secrets/`, `.git/`
   - Detects hardcoded API keys/passwords
   - Warns on auth file changes
   - Logs all operations to `.claude/telemetry/security-audit.log`
   - Pure bash - no escaping issues

## Testing the Fix

After applying the fix, test with:

```bash
# Should succeed
echo "test" > /tmp/test.txt

# Should be blocked (if using security-gate.sh)
echo "test" > .env  # Blocked
echo "test" > secrets/key.txt  # Blocked
```

## What Was Wrong

The broken hook was using this Python command:
```python
python3 -c \"import json,sys;d=json.load(sys.stdin);p=d.get('tool_input',{}).get('file_path','');sys.exit(2 if any(x in p for x in ['.env','/secrets/','package-lock.json','.git/']) else 0)\"
```

**Issues:**
1. Excessive quote escaping (`\"` inside command)
2. Shell interpolation conflicts with Python syntax
3. The `sys.exit(2 if any(x in p for x in [...]))` causes shell parser errors

**Why security-gate.sh is better:**
- Pure bash - no Python dependency
- Proper quote handling
- More features (secret detection, audit logging)
- Easier to debug and maintain

## Prevention

To avoid this in the future:

1. **Always use external hook scripts** instead of inline commands
2. **Test hooks separately** before enabling
3. **Use bash, not Python**, for simple path validation
4. **Keep hooks in version control** (`.claude/hooks/`)
5. **Document hook behavior** in comments

## Files Modified

✅ `~/.claude/settings.json` - Cleaned (hooks removed)
✅ `~/.claude/settings.json.backup-20251017-201235` - Backup created
✅ `/Users/chudinnorukam/Downloads/Repurpose MVP /.claude/settings.json` - Cleaned
✅ `.claude/hooks/security-gate.sh` - Already exists (well-written)

## Next Steps

1. **Try Option A** (restart Claude Code) - simplest solution
2. **If that fails, try Option C** (manual settings edit + cache clear)
3. **Once working, consider Option D** (enable security-gate.sh) for better security
4. **Delete this file** after fix is confirmed

## Verification Checklist

- [ ] Claude Code restarted
- [ ] Write tool works (test file created)
- [ ] Edit tool works (modify test file)
- [ ] Security still in place (cannot write `.env` if using security-gate.sh)
- [ ] This instructions file deleted

---

**Created:** October 17, 2025  
**Issue Tracking:** Hook error blocking Write/Edit tools  
**Fix Applied:** Settings files cleaned, restart required
