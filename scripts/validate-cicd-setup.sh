#!/bin/bash

# CI/CD Setup Validation Script
# This script checks if all required files and configurations are in place

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CI/CD Setup Validation Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check counter
checks_passed=0
checks_failed=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} $2 - File not found: $1"
        ((checks_failed++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} $2 - Directory not found: $1"
        ((checks_failed++))
    fi
}

echo -e "${YELLOW}Checking GitHub Actions Workflows...${NC}"
check_dir ".github/workflows" "Workflows directory exists"
check_file ".github/workflows/ci.yml" "CI workflow exists"
check_file ".github/workflows/docker-build.yml" "Docker build workflow exists"
check_file ".github/workflows/deploy-production.yml" "Production deployment workflow exists"
check_file ".github/workflows/deploy-staging.yml" "Staging deployment workflow exists"
check_file ".github/workflows/security-scan.yml" "Security scan workflow exists"
check_file ".github/workflows/dependency-updates.yml" "Dependency updates workflow exists"
check_file ".github/workflows/pr-checks.yml" "PR checks workflow exists"
check_file ".github/workflows/workflow-status.yml" "Workflow status report exists"

echo -e "\n${YELLOW}Checking Configuration Files...${NC}"
check_file ".github/dependabot.yml" "Dependabot configuration exists"
check_file ".github/labeler.yml" "Auto-labeler configuration exists"
check_file "Dockerfile" "Dockerfile exists"
check_file "docker-compose.yml" "Docker Compose file exists"
check_file "docker-compose.staging.yml" "Staging Docker Compose file exists"
check_file "docker-compose.production.yml" "Production Docker Compose file exists"
check_file ".env.example" "Environment template exists"
check_file ".dockerignore" "Docker ignore file exists"

echo -e "\n${YELLOW}Checking Documentation...${NC}"
check_file "CI-CD-DOCUMENTATION.md" "CI/CD documentation exists"
check_file ".github/CICD-QUICK-START.md" "Quick start guide exists"

echo -e "\n${YELLOW}Checking Package Configuration...${NC}"
check_file "package.json" "package.json exists"

# Check if package.json has required scripts
if [ -f "package.json" ]; then
    if grep -q '"lint"' package.json; then
        echo -e "${GREEN}✓${NC} Lint script defined in package.json"
        ((checks_passed++))
    else
        echo -e "${YELLOW}!${NC} Lint script not found in package.json (recommended)"
    fi

    if grep -q '"build"' package.json; then
        echo -e "${GREEN}✓${NC} Build script defined in package.json"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} Build script not found in package.json (required)"
        ((checks_failed++))
    fi

    if grep -q '"test"' package.json; then
        echo -e "${GREEN}✓${NC} Test script defined in package.json"
        ((checks_passed++))
    else
        echo -e "${YELLOW}!${NC} Test script not found in package.json (recommended)"
    fi
fi

echo -e "\n${YELLOW}Checking Git Configuration...${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    ((checks_passed++))

    # Check if we're on a branch
    current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    if [ -n "$current_branch" ]; then
        echo -e "${GREEN}✓${NC} Current branch: ${current_branch}"
        ((checks_passed++))
    fi

    # Check if remote exists
    remote_url=$(git config --get remote.origin.url 2>/dev/null || echo "")
    if [ -n "$remote_url" ]; then
        echo -e "${GREEN}✓${NC} Remote repository configured"
        ((checks_passed++))
    else
        echo -e "${YELLOW}!${NC} No remote repository configured"
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
    ((checks_failed++))
fi

echo -e "\n${YELLOW}Checking .gitignore...${NC}"
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC} .gitignore exists"
    ((checks_passed++))

    # Check for important entries
    if grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✓${NC} node_modules in .gitignore"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} node_modules not in .gitignore (important!)"
        ((checks_failed++))
    fi

    if grep -q ".env.local" .gitignore; then
        echo -e "${GREEN}✓${NC} .env.local in .gitignore"
        ((checks_passed++))
    else
        echo -e "${YELLOW}!${NC} .env.local not in .gitignore (recommended)"
    fi
else
    echo -e "${RED}✗${NC} .gitignore not found"
    ((checks_failed++))
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Validation Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Checks passed:${NC} $checks_passed"
echo -e "${RED}Checks failed:${NC} $checks_failed"

if [ $checks_failed -eq 0 ]; then
    echo -e "\n${GREEN}✓ All critical checks passed!${NC}"
    echo -e "${GREEN}Your CI/CD setup is ready to use.${NC}\n"
    exit 0
else
    echo -e "\n${YELLOW}⚠ Some checks failed.${NC}"
    echo -e "${YELLOW}Please review the errors above and fix them.${NC}\n"
    exit 1
fi
