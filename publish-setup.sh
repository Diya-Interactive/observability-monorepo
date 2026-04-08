#!/bin/bash

# Publishing Setup Script
# Run this after creating your GitHub repository

echo "🚀 Observability Monorepo - Publishing Setup"
echo ""
echo "This script will help you publish to GitHub."
echo ""

# Step 1: Get GitHub URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/observability-monorepo.git): " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    echo "❌ GitHub URL is required"
    exit 1
fi

# Step 2: Add remote and push
cd /home/abdul-rafay/work/global-alerting-monitoring
git remote add origin "$GITHUB_URL"
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Go to: $GITHUB_URL/settings/secrets/actions"
    echo "2. Add these secrets:"
    echo "   - NPM_TOKEN (get from: npm token create)"
    echo "   - PYPI_TOKEN (get from: https://pypi.org/account/)"
    echo "   - NUGET_TOKEN (get from: https://www.nuget.org/account/)"
    echo ""
    echo "3. After adding secrets, create a release:"
    echo "   git tag -a v1.0.0 -m 'Release v1.0.0'"
    echo "   git push origin v1.0.0"
    echo ""
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi
