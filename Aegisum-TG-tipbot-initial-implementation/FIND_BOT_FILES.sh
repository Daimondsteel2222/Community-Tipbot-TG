#!/bin/bash

echo "🔍 FINDING YOUR BOT FILES..."
echo "================================"

echo ""
echo "📁 Current directory contents:"
ls -la

echo ""
echo "📁 Looking for bot.js files:"
find ~/Community-Tipbot-TG -name "bot.js" -type f 2>/dev/null || echo "No bot.js found in ~/Community-Tipbot-TG"

echo ""
echo "📁 Looking for main bot files:"
find ~/Community-Tipbot-TG -name "*.js" -type f | head -10

echo ""
echo "📁 Directory structure:"
find ~/Community-Tipbot-TG -type d | head -10

echo ""
echo "📁 All subdirectories in Community-Tipbot-TG:"
ls -la ~/Community-Tipbot-TG/

echo ""
echo "🎯 SOLUTION: Let's check if bot files are in a different subdirectory..."