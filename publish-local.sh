#!/bin/bash

set -e

echo "🚀 Local Publishing Script for Observability Monorepo"
echo "======================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the root directory?${NC}"
    exit 1
fi

# Parse arguments
SKIP_NPM=false
SKIP_PYPI=false
SKIP_NUGET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-npm) SKIP_NPM=true; shift ;;
        --skip-pypi) SKIP_PYPI=true; shift ;;
        --skip-nuget) SKIP_NUGET=true; shift ;;
        --skip-all) SKIP_NPM=true; SKIP_PYPI=true; SKIP_NUGET=true; shift ;;
        --help)
            echo "Usage: ./publish-local.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-npm       Skip npm publishing"
            echo "  --skip-pypi      Skip PyPI publishing"
            echo "  --skip-nuget     Skip NuGet publishing"
            echo "  --skip-all       Skip all publishing (only build)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *) shift ;;
    esac
done

# ============================================================================
# NPM Publishing
# ============================================================================

if [ "$SKIP_NPM" = false ]; then
    echo -e "${BLUE}📦 Publishing to npm...${NC}"
    echo ""
    
    # Check if npm is configured
    if ! npm whoami &>/dev/null; then
        echo -e "${YELLOW}⚠️  Not logged into npm. Please run 'npm login' first.${NC}"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping npm publishing"
            SKIP_NPM=true
        fi
    fi
    
    if [ "$SKIP_NPM" = false ]; then
        echo -e "${YELLOW}🔨 Building Node.js packages...${NC}"
        npm run build --workspaces
        echo -e "${GREEN}✅ Build complete${NC}"
        echo ""
        
        echo -e "${YELLOW}📤 Publishing @rafaynpmorg/observability...${NC}"
        npm publish -w @rafaynpmorg/observability --verbose
        echo -e "${GREEN}✅ Published @rafaynpmorg/observability${NC}"
        echo ""
        
        echo -e "${YELLOW}📤 Publishing @rafaynpmorg/observability-cli...${NC}"
        npm publish -w @rafaynpmorg/observability-cli --verbose
        echo -e "${GREEN}✅ Published @rafaynpmorg/observability-cli${NC}"
        echo ""
    fi
fi

# ============================================================================
# PyPI Publishing
# ============================================================================

if [ "$SKIP_PYPI" = false ]; then
    echo -e "${BLUE}🐍 Publishing to PyPI...${NC}"
    echo ""
    
    cd packages/sdk-python
    
    echo -e "${YELLOW}🔨 Building Python distribution...${NC}"
    rm -rf build dist *.egg-info
    python -m build --verbose
    echo -e "${GREEN}✅ Build complete${NC}"
    echo ""
    
    echo -e "${YELLOW}🔍 Checking distribution...${NC}"
    twine check dist/*
    echo -e "${GREEN}✅ Distribution check passed${NC}"
    echo ""
    
    echo -e "${YELLOW}📤 Publishing to PyPI...${NC}"
    twine upload dist/* --verbose
    echo -e "${GREEN}✅ Published to PyPI${NC}"
    echo ""
    
    cd ../..
fi

# ============================================================================
# NuGet Publishing
# ============================================================================

if [ "$SKIP_NUGET" = false ]; then
    echo -e "${BLUE}📕 Publishing to NuGet...${NC}"
    echo ""
    
    cd packages/sdk-dotnet
    
    echo -e "${YELLOW}🔨 Building .NET package...${NC}"
    dotnet clean --configuration Release 2>/dev/null || true
    dotnet restore --verbosity detailed
    dotnet build --configuration Release --verbosity detailed
    echo -e "${GREEN}✅ Build complete${NC}"
    echo ""
    
    echo -e "${YELLOW}📦 Packing NuGet package...${NC}"
    rm -rf nupkg
    dotnet pack --configuration Release --output ./nupkg --verbosity detailed
    echo -e "${GREEN}✅ Pack complete${NC}"
    echo ""
    
    echo -e "${YELLOW}📋 NuGet package files:${NC}"
    ls -lah nupkg/
    echo ""
    
    echo -e "${YELLOW}📤 Publishing to NuGet...${NC}"
    if [ -z "$NUGET_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  NUGET_TOKEN not set. You'll be prompted for API key.${NC}"
        read -sp "Enter NuGet API key: " NUGET_TOKEN
        echo
    fi
    
    dotnet nuget push nupkg/*.nupkg \
        --api-key "$NUGET_TOKEN" \
        --source https://api.nuget.org/v3/index.json \
        --skip-duplicate
    
    echo -e "${GREEN}✅ Published to NuGet${NC}"
    echo ""
    
    cd ../..
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo -e "${GREEN}✨ Publishing complete!${NC}"
echo ""
echo "📊 Published Packages:"

if [ "$SKIP_NPM" = false ]; then
    echo "  ✅ @rafaynpmorg/observability (npm)"
    echo "  ✅ @rafaynpmorg/observability-cli (npm)"
fi

if [ "$SKIP_PYPI" = false ]; then
    echo "  ✅ your-org-observability (PyPI)"
fi

if [ "$SKIP_NUGET" = false ]; then
    echo "  ✅ YourOrg.Observability (NuGet)"
fi

echo ""
echo "🔗 Package links:"
echo "  npm: https://www.npmjs.com/package/@rafaynpmorg/observability"
echo "  npm: https://www.npmjs.com/package/@rafaynpmorg/observability-cli"
echo "  PyPI: https://pypi.org/project/your-org-observability/"
echo "  NuGet: https://www.nuget.org/packages/YourOrg.Observability/"
echo ""
