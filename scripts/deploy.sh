#!/bin/bash
# Naroa Web - Deploy Script
# Usage: ./scripts/deploy.sh "commit message"

set -e

echo "🔄 Regenerando índice de imágenes..."
node scripts/images/generate-images-index.js 2>/dev/null || echo "⚠️  Índice no regenerado (opcional)"

echo "📦 Añadiendo cambios..."
git add -A

if [ -z "$1" ]; then
    git commit -m "chore: update"
else
    git commit -m "$1"
fi

echo "🚀 Desplegando a Vercel..."
git push origin main

echo "✅ Deploy completado! Verifica en https://naroa.online"
