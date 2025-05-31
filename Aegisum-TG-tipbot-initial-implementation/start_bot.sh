#!/bin/bash

echo "🤖 Starting Community TipBot..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run install.sh first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the bot
node src/index.js
