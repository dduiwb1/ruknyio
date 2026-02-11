#!/bin/bash
# Railway Deployment Verification Script
# This script verifies that all necessary files and configurations are in place

set -e

echo "🚀 Railway Deployment Verification Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} File exists: $1"
        return 0
    else
        echo -e "${RED}❌${NC} File missing: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} Directory exists: $1"
        return 0
    else
        echo -e "${RED}❌${NC} Directory missing: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_git_status() {
    if git status > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} Git repository detected"
        UNTRACKED=$(git status --short | wc -l)
        if [ "$UNTRACKED" -gt 0 ]; then
            echo -e "${YELLOW}⚠️${NC}  Untracked changes: $UNTRACKED files"
            echo "   Run 'git status' to see details"
        fi
    else
        echo -e "${RED}❌${NC} Not a git repository"
        ERRORS=$((ERRORS + 1))
    fi
}

check_package_json() {
    if grep -q '"build"' "$1"; then
        echo -e "${GREEN}✅${NC} Build script found in $(basename $1)"
    else
        echo -e "${RED}❌${NC} Build script missing in $(basename $1)"
        ERRORS=$((ERRORS + 1))
    fi
}

# Run checks
echo "📁 Checking Critical Files..."
echo ""

check_file "./Dockerfile"
check_file "./.dockerignore"
check_file "./railway.json"
check_file "./apps/api/.env.production"
check_file "./RAILWAY_DEPLOYMENT_GUIDE.md"

echo ""
echo "📦 Checking Project Structure..."
echo ""

check_directory "./apps/api"
check_directory "./apps/api/src"
check_directory "./apps/api/prisma"
check_directory "./packages"

echo ""
echo "🔧 Checking Configuration Files..."
echo ""

check_file "./apps/api/package.json"
check_file "./apps/api/tsconfig.json"
check_file "./apps/api/nest-cli.json"
check_file "./apps/api/prisma/schema.prisma"
check_file "./package.json"

echo ""
echo "📝 Checking Package.json Scripts..."
echo ""

check_package_json "./apps/api/package.json"

echo ""
echo "🔑 Checking Environment..."
echo ""

check_git_status

echo ""
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅${NC} npm is installed - $(npm -v)"
else
    echo -e "${RED}❌${NC} npm not found in PATH"
    ERRORS=$((ERRORS + 1))
fi

if command -v node &> /dev/null; then
    echo -e "${GREEN}✅${NC} Node.js is installed - $(node -v)"
else
    echo -e "${RED}❌${NC} Node.js not found in PATH"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit files: git add . && git commit -m 'chore: add Railway deployment config'"
    echo "2. Push to GitHub: git push"
    echo "3. Create Railway project: https://railway.app"
    echo "4. Connect GitHub repository"
    echo "5. Add PostgreSQL and Redis services"
    echo "6. Set environment variables in Railway Dashboard"
    echo "7. Deploy!"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    echo ""
    echo "Please fix the issues above before deploying to Railway."
    exit 1
fi
