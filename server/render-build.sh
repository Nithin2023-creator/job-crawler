#!/usr/bin/env bash
# Render Build Script for Night Crawler
set -o errexit

echo "📦 Installing dependencies..."
npm install

echo "🌐 Installing Chromium for Puppeteer..."
npx puppeteer browsers install chrome

echo "✅ Build complete!"
