#!/bin/bash

set -e

echo "🔨 Building .NET SDK"
echo "===================="
echo ""

cd packages/sdk-dotnet

# Check dependencies
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK is not installed"
    exit 1
fi

echo "📋 Versions:"
dotnet --version
echo ""

# Show available SDKs
echo "📦 Available .NET SDKs:"
dotnet --list-sdks
echo ""

# Restore
echo "📦 Restoring dependencies..."
dotnet restore --verbosity detailed
echo "✅ Dependencies restored"
echo ""

# Build
echo "🔨 Building .NET SDK..."
dotnet build --configuration Release --no-restore --verbosity detailed
echo "✅ Build complete"
echo ""

# Clean NuGet package output
echo "🧹 Preparing for packaging..."
rm -rf nupkg
echo ""

# Pack
echo "📦 Creating NuGet package..."
dotnet pack --configuration Release --output ./nupkg --verbosity detailed
echo "✅ NuGet package created"
echo ""

# Show outputs
echo "📁 NuGet package artifacts:"
ls -lah nupkg/
echo ""

cd ../..
echo "✨ .NET build successful!"
