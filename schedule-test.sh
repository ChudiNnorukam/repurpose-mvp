#!/bin/bash

# Calculate time 1 minute from now
SCHEDULE_TIME=$(date -u -d "+1 minute" "+%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+1M "+%Y-%m-%dT%H:%M:%S.000Z")

echo "🚀 Scheduling Twitter post for: $SCHEDULE_TIME"
echo ""

curl -X POST https://repurpose-orpin.vercel.app/api/schedule \
  -H "Content-Type: application/json" \
  -d "{
    \"platform\": \"twitter\",
    \"content\": \"✅ Test post from Claude Code - autopost verification 🤖\",
    \"originalContent\": \"Testing autopost\",
    \"scheduledTime\": \"$SCHEDULE_TIME\",
    \"userId\": \"332b63c1-b1f7-4a07-9eba-6817ce3803ac\"
  }"

echo ""
echo ""
echo "✅ Post scheduled! It will appear on Twitter in 1 minute."
echo "🐦 Check your Twitter feed at: https://twitter.com"
