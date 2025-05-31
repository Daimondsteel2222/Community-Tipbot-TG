#!/bin/bash

echo "🌐 Starting Community TipBot Dashboard..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run install.sh first."
    exit 1
fi

# Check if dashboard dependencies exist
if [ ! -d web-dashboard/node_modules ]; then
    echo "📦 Installing dashboard dependencies..."
    cd web-dashboard
    npm install
    cd ..
fi

# Start the dashboard
node start_dashboard.js
