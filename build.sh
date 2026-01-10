#!/bin/bash
set -e

echo "🚀 Starting Node.js build process..."
echo "Node version: TON(node --version)"
echo "NPM version: TON(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"