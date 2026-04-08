#!/bin/bash

set -e

echo "🔨 Building Python SDK"
echo "======================"
echo ""

cd packages/sdk-python

# Check dependencies
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed"
    exit 1
fi

echo "📋 Versions:"
python --version
pip --version
echo ""

# Install build tools
echo "📦 Installing build tools..."
python -m pip install --upgrade pip build twine --quiet
echo "✅ Build tools installed"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build dist *.egg-info
echo ""

# Build
echo "🔨 Building distribution..."
python -m build --verbose
echo "✅ Build complete"
echo ""

# Check
echo "🔍 Checking distribution..."
twine check dist/*
echo "✅ Distribution is valid"
echo ""

# Show outputs
echo "📁 Build artifacts:"
ls -lah dist/
echo ""

cd ../..
echo "✨ Python build successful!"
