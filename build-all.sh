#!/bin/bash

set -e

echo "🔨 Building All Packages Locally"
echo "================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parse arguments
BUILD_NODE=true
BUILD_PYTHON=true
BUILD_DOTNET=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-node) BUILD_NODE=false; shift ;;
        --skip-python) BUILD_PYTHON=false; shift ;;
        --skip-dotnet) BUILD_DOTNET=false; shift ;;
        --node-only) BUILD_PYTHON=false; BUILD_DOTNET=false; shift ;;
        --python-only) BUILD_NODE=false; BUILD_DOTNET=false; shift ;;
        --dotnet-only) BUILD_NODE=false; BUILD_PYTHON=false; shift ;;
        --help)
            echo "Usage: ./build-all.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-node      Skip Node.js build"
            echo "  --skip-python    Skip Python build"
            echo "  --skip-dotnet    Skip .NET build"
            echo "  --node-only      Build only Node.js"
            echo "  --python-only    Build only Python"
            echo "  --dotnet-only    Build only .NET"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *) shift ;;
    esac
done

# ============================================================================
# Node.js Build
# ============================================================================

if [ "$BUILD_NODE" = true ]; then
    echo -e "${BLUE}📦 Building Node.js packages...${NC}"
    echo ""
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        BUILD_NODE=false
    else
        npm ci --quiet
        npm run build --workspaces --verbose
        echo -e "${GREEN}✅ Node.js build complete${NC}"
        echo ""
    fi
fi

# ============================================================================
# Python Build
# ============================================================================

if [ "$BUILD_PYTHON" = true ]; then
    echo -e "${BLUE}🐍 Building Python SDK...${NC}"
    echo ""
    
    if ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Python is not installed${NC}"
        BUILD_PYTHON=false
    else
        cd packages/sdk-python
        python -m pip install --upgrade pip build twine --quiet
        rm -rf build dist *.egg-info
        python -m build --verbose
        echo -e "${GREEN}✅ Python build complete${NC}"
        echo ""
        cd ../..
    fi
fi

# ============================================================================
# .NET Build
# ============================================================================

if [ "$BUILD_DOTNET" = true ]; then
    echo -e "${BLUE}📕 Building .NET SDK...${NC}"
    echo ""
    
    if ! command -v dotnet &> /dev/null; then
        echo -e "${RED}❌ .NET SDK is not installed${NC}"
        BUILD_DOTNET=false
    else
        cd packages/sdk-dotnet
        dotnet restore --verbosity detailed
        dotnet build --configuration Release --no-restore --verbosity detailed
        rm -rf nupkg
        dotnet pack --configuration Release --output ./nupkg --verbosity detailed
        echo -e "${GREEN}✅ .NET build complete${NC}"
        echo ""
        cd ../..
    fi
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo -e "${GREEN}✨ Build complete!${NC}"
echo ""
echo "📊 Build Summary:"

if [ "$BUILD_NODE" = true ]; then
    echo "  ✅ Node.js packages built"
    echo "     - @your-org/observability"
    echo "     - @your-org/observability-cli"
fi

if [ "$BUILD_PYTHON" = true ]; then
    echo "  ✅ Python SDK built"
    echo "     - your-org-observability"
fi

if [ "$BUILD_DOTNET" = true ]; then
    echo "  ✅ .NET SDK built"
    echo "     - YourOrg.Observability"
fi

echo ""
echo "🚀 Next steps:"
echo "  • Publish to registries: ./publish-local.sh"
echo "  • Or publish individually:"
echo "    - npm publish -w @your-org/observability"
echo "    - npm publish -w @your-org/observability-cli"
echo "    - cd packages/sdk-python && twine upload dist/*"
echo "    - cd packages/sdk-dotnet && dotnet nuget push nupkg/*.nupkg"
echo ""
