#!/bin/bash

# Test Script for DSPy + MLOps Enhanced Content Generator
# This script tests all the new features

echo "🚀 Testing Enhanced Content Generator with DSPy + MLOps"
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
API_URL="${API_URL:-http://localhost:3001}"

# Test function
test_endpoint() {
    local name=$1
    local endpoint=$2
    local data=$3
    
    echo -e "${BLUE}Testing: $name${NC}"
    response=$(curl -s -X POST "$API_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "$response" | python3 -m json.tool | head -20
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
    echo ""
}

echo "1. Testing DSPy-Optimized Keyword Generation"
echo "--------------------------------------------"
test_endpoint \
    "Keywords with DSPy" \
    "/api/keywords" \
    '{"seedKeyword": "artificial intelligence", "useDspy": true}'

echo "2. Testing Manual Keyword Generation (for comparison)"
echo "------------------------------------------------------"
test_endpoint \
    "Keywords Manual" \
    "/api/keywords" \
    '{"seedKeyword": "artificial intelligence", "useDspy": false}'

echo "3. Testing Title Generation with DSPy"
echo "--------------------------------------"
test_endpoint \
    "Titles with DSPy" \
    "/api/titles" \
    '{"keyword": "machine learning", "useDspy": true}'

echo "4. Testing Topic Generation"
echo "----------------------------"
test_endpoint \
    "Topics" \
    "/api/topics" \
    '{"title": "Getting Started with AI", "useDspy": true}'

echo "5. Testing Content Generation"
echo "------------------------------"
test_endpoint \
    "Content" \
    "/api/content" \
    '{"topic": "Introduction to Neural Networks", "useDspy": true}'

echo "6. Fetching Overall Metrics"
echo "----------------------------"
echo -e "${BLUE}GET $API_URL/api/metrics${NC}"
curl -s "$API_URL/api/metrics" | python3 -m json.tool
echo ""

echo "7. Fetching Prompt Version Comparison"
echo "--------------------------------------"
echo -e "${BLUE}GET $API_URL/api/metrics/comparison${NC}"
curl -s "$API_URL/api/metrics/comparison" | python3 -m json.tool
echo ""

echo "8. Fetching Metrics History (Last 24h)"
echo "---------------------------------------"
echo -e "${BLUE}GET $API_URL/api/metrics/history?hours=24${NC}"
curl -s "$API_URL/api/metrics/history?hours=24" | python3 -m json.tool | head -30
echo ""

echo "========================================================"
echo -e "${GREEN}✓ All tests complete!${NC}"
echo ""
echo "📊 View the database:"
echo "   sqlite3 backend/mlops_data.db 'SELECT COUNT(*) as total_calls FROM llm_metrics;'"
echo ""
echo "📈 View metrics in browser:"
echo "   $API_URL/api/metrics"
echo ""
echo "🎯 Next steps:"
echo "   1. Review quality scores (should improve with DSPy)"
echo "   2. Compare latency between manual and DSPy prompts"
echo "   3. Monitor costs with /api/metrics endpoint"
echo ""
