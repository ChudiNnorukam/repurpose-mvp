#!/bin/bash

# Playwright-Linear Integration Runner
# Runs tests iteratively and tracks improvements via Linear

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_ITERATIONS=${MAX_ITERATIONS:-5}
LINEAR_PROJECT=${LINEAR_PROJECT:-"Repurpose MVP"}
REPORT_DIR="test-results/linear-integration"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Playwright-Linear MCP Integration${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check for Linear API key
if [ -z "$LINEAR_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  LINEAR_API_KEY not set${NC}"
  echo -e "To enable Linear integration, set your API key:"
  echo -e "  export LINEAR_API_KEY='your_api_key_here'\n"
  echo -e "Get your API key from: https://linear.app/settings/api\n"
  echo -e "Continuing without Linear integration (mock mode)...\n"
fi

# Create report directory
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}Configuration:${NC}"
echo -e "  Project: ${GREEN}$LINEAR_PROJECT${NC}"
echo -e "  Max Iterations: ${GREEN}$MAX_ITERATIONS${NC}"
echo -e "  Report Dir: ${GREEN}$REPORT_DIR${NC}\n"

# Run iterations
for i in $(seq 1 $MAX_ITERATIONS); do
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Iteration $i of $MAX_ITERATIONS${NC}"
  echo -e "${BLUE}========================================${NC}\n"

  export ITERATION=$i
  export LINEAR_PROJECT

  # Run the integration script
  npm run test:linear

  # Check if all tests passed
  LATEST_REPORT=$(ls -t "$REPORT_DIR"/iteration-*-report.json | head -1)

  if [ -f "$LATEST_REPORT" ]; then
    PASS_RATE=$(cat "$LATEST_REPORT" | grep -o '"passRate":[0-9]*' | cut -d':' -f2)
    FAILED=$(cat "$LATEST_REPORT" | grep -o '"failed":[0-9]*' | cut -d':' -f2)

    echo -e "\n${BLUE}Iteration $i Results:${NC}"
    echo -e "  Pass Rate: ${GREEN}${PASS_RATE}%${NC}"
    echo -e "  Failed Tests: ${RED}${FAILED}${NC}\n"

    if [ "$PASS_RATE" = "100" ]; then
      echo -e "${GREEN}🎉 All tests passed! Stopping iterations.${NC}\n"
      break
    fi
  fi

  # Pause between iterations (except last one)
  if [ $i -lt $MAX_ITERATIONS ]; then
    echo -e "${YELLOW}Waiting 5 seconds before next iteration...${NC}\n"
    sleep 5
  fi
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Integration Complete${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "📊 ${GREEN}Reports generated in: $REPORT_DIR${NC}"
echo -e "📝 ${GREEN}View the latest report:${NC}"
echo -e "   cat $(ls -t "$REPORT_DIR"/*.md | head -1)\n"

# Generate summary
echo -e "${BLUE}Generating summary...${NC}\n"

TOTAL_ITERATIONS=$(ls "$REPORT_DIR"/iteration-*-report.json 2>/dev/null | wc -l | tr -d ' ')

if [ "$TOTAL_ITERATIONS" -gt 0 ]; then
  echo -e "${GREEN}Summary Across All Iterations:${NC}"
  echo -e "  Total Iterations Run: ${TOTAL_ITERATIONS}"

  for report in $(ls -t "$REPORT_DIR"/iteration-*-report.json); do
    ITER=$(echo "$report" | grep -o 'iteration-[0-9]*' | cut -d'-' -f2)
    PASS_RATE=$(cat "$report" | grep -o '"passRate":[0-9]*' | cut -d':' -f2)
    echo -e "  Iteration $ITER: ${PASS_RATE}% pass rate"
  done

  echo ""
fi

echo -e "${GREEN}✅ Done!${NC}\n"
