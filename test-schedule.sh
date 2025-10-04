#!/bin/bash

echo "🔍 Testing Schedule API on Production"
echo ""

# Test with valid future time (1 hour from now)
FUTURE_TIME=$(date -u -v+1H +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "+1 hour" +"%Y-%m-%dT%H:%M:%S.000Z")

echo "Testing schedule API with time: $FUTURE_TIME"
echo ""

# Replace YOUR_USER_ID with actual user ID from Supabase
USER_ID="YOUR_USER_ID"

curl -X POST https://repurpose-orpin.vercel.app/api/schedule \
  -H "Content-Type: application/json" \
  -d "{
    \"platform\": \"twitter\",
    \"content\": \"Test post from diagnostic script\",
    \"originalContent\": \"Test\",
    \"scheduledTime\": \"$FUTURE_TIME\",
    \"userId\": \"$USER_ID\"
  }" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  | jq . 2>/dev/null || cat

echo ""
echo "✅ Check the error message above"
echo "Common errors:"
echo "  - 'User does not exist' → Your user ID is wrong"
echo "  - 'Foreign key constraint' → User not in auth.users table"
echo "  - 'Missing required fields' → Request format issue"
echo "  - 'QStash' error → QStash configuration issue"
