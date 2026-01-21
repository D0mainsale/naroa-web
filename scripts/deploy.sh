#!/bin/bash
set -e

echo "🚀 Deploying Naroa Web..."

# Step 1: Regenerate image indexes
echo "📸 Regenerating image indexes..."
node scripts/generate-images-index.js

# Step 2: Fetch latest data from Notion CMS (if configured)
if [ -f .env ]; then
  echo "🔄 Fetching artwork data from Notion..."
  node scripts/fetch-notion.js || echo "⚠️  Notion fetch skipped (not configured)"
else
  echo "⚠️  No .env file found, skipping Notion fetch"
fi

# Step 3: Git operations
echo "📦 Committing changes..."
git add -A
git commit -m "deploy: auto-sync $(date +'%Y-%m-%d %H:%M')" || echo "No changes to commit"

echo "🚢 Pushing to remote..."
git push

echo "✅ Deploy complete! Vercel will rebuild automatically."
online"
