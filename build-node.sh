#!/bin/bash

set -e

echo "🔨 Building Node.js SDK and CLI"
echo "================================"
echo ""

# Check dependencies
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "📋 Versions:"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Build
echo "🔨 Building packages..."
npm run build --workspaces --verbose
echo "✅ Build complete"
echo ""

# Show outputs
echo "📁 Build artifacts:"
find packages/sdk-node packages/cli -name "dist" -type d -exec ls -lah {} \;
echo ""

echo "✨ Node.js build successful!"
