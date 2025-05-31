#!/bin/bash

# Community TipBot Installation Script
echo "🤖 Community TipBot Installation"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install dashboard dependencies
echo ""
echo "📦 Installing dashboard dependencies..."
cd web-dashboard
npm install
cd ..

# Create data directory
echo ""
echo "📁 Creating data directory..."
mkdir -p data
mkdir -p logs

# Copy sample environment file
echo ""
echo "⚙️  Setting up configuration..."
if [ ! -f .env ]; then
    cp .env.sample .env
    echo "✅ Created .env file from sample"
    echo "💡 Please edit .env file with your configuration"
else
    echo "⚠️  .env file already exists, skipping"
fi

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x start_bot.sh
chmod +x start_dashboard.sh
chmod +x debug_aegs_issue.js
chmod +x fix_issues.js

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start your coin daemons (AEGS, SHIC, PEPE, ADVC)"
echo "3. Run: ./start_bot.sh"
echo "4. Run: ./start_dashboard.sh (in another terminal)"
echo ""
echo "🌐 Dashboard will be available at: http://localhost:12000"
echo "🔑 Default dashboard password: admin123"
