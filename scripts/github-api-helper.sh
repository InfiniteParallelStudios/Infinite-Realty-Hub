#!/bin/bash

# GitHub API Helper Script
# Provides reliable GitHub operations when MCP server fails
# Usage: ./github-api-helper.sh <action> [parameters]

set -e

# Configuration
GITHUB_TOKEN="${GITHUB_TOKEN:-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}"
REPO_OWNER="InfiniteParallelStudios"
REPO_NAME="infinite-realty-hub"
API_BASE="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to make GitHub API calls
github_api() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    echo -e "${BLUE}Making GitHub API call: ${method} ${endpoint}${NC}"
    
    if [ -n "$data" ]; then
        curl -X "$method" \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint"
    else
        curl -X "$method" \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "$endpoint"
    fi
}

# Function to add a comment to an issue
add_comment() {
    local issue_number="$1"
    local comment_body="$2"
    
    echo -e "${BLUE}Adding comment to issue #${issue_number}${NC}"
    
    local data="{\"body\":$(echo "$comment_body" | jq -R .)}"
    github_api "POST" "${API_BASE}/issues/${issue_number}/comments" "$data"
    
    echo -e "${GREEN}✅ Comment added successfully${NC}"
}

# Function to close an issue
close_issue() {
    local issue_number="$1"
    
    echo -e "${BLUE}Closing issue #${issue_number}${NC}"
    
    local data='{"state":"closed"}'
    github_api "PATCH" "${API_BASE}/issues/${issue_number}" "$data"
    
    echo -e "${GREEN}✅ Issue closed successfully${NC}"
}

# Function to get issue details
get_issue() {
    local issue_number="$1"
    
    echo -e "${BLUE}Getting issue #${issue_number} details${NC}"
    
    github_api "GET" "${API_BASE}/issues/${issue_number}"
}

# Function to list open issues
list_issues() {
    echo -e "${BLUE}Listing open issues${NC}"
    
    github_api "GET" "${API_BASE}/issues?state=open"
}

# Function to create a new issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo -e "${BLUE}Creating new issue: ${title}${NC}"
    
    local data="{\"title\":$(echo "$title" | jq -R .),\"body\":$(echo "$body" | jq -R .)}"
    if [ -n "$labels" ]; then
        data=$(echo "$data" | jq --argjson labels "$labels" '. + {labels: $labels}')
    fi
    
    github_api "POST" "${API_BASE}/issues" "$data"
    
    echo -e "${GREEN}✅ Issue created successfully${NC}"
}

# Main command dispatcher
case "$1" in
    "add-comment")
        if [ $# -ne 3 ]; then
            echo -e "${RED}Usage: $0 add-comment <issue_number> <comment_body>${NC}"
            exit 1
        fi
        add_comment "$2" "$3"
        ;;
    "close-issue")
        if [ $# -ne 2 ]; then
            echo -e "${RED}Usage: $0 close-issue <issue_number>${NC}"
            exit 1
        fi
        close_issue "$2"
        ;;
    "get-issue")
        if [ $# -ne 2 ]; then
            echo -e "${RED}Usage: $0 get-issue <issue_number>${NC}"
            exit 1
        fi
        get_issue "$2"
        ;;
    "list-issues")
        list_issues
        ;;
    "create-issue")
        if [ $# -lt 3 ]; then
            echo -e "${RED}Usage: $0 create-issue <title> <body> [labels_json]${NC}"
            exit 1
        fi
        create_issue "$2" "$3" "$4"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Available commands:"
        echo "  add-comment <issue_number> <comment_body>"
        echo "  close-issue <issue_number>"
        echo "  get-issue <issue_number>"
        echo "  list-issues"
        echo "  create-issue <title> <body> [labels_json]"
        exit 1
        ;;
esac
