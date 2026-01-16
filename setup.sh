#!/bin/bash

echo "========================================"
echo "AI Demos Dashboard - Quick Setup"
echo "========================================"
echo ""

# Check if running from the correct directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: Please run this script from the ai-demos-dashboard directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Python
echo "🔍 Checking for Python..."
if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi
echo "✅ Python 3 found: $(python3 --version)"

# Check for Node.js
echo "🔍 Checking for Node.js..."
if ! command_exists node; then
    echo "⚠️  Node.js is not installed. Some projects require Node.js."
    echo "   You can continue, but Node.js projects won't work."
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Node.js found: $(node --version)"
fi

# Create virtual environment if it doesn't exist
echo ""
echo "📦 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
playwright install

echo ""
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "To start the dashboard:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run the dashboard: python app.py"
echo "  3. Open your browser to: http://localhost:5000"
echo ""
echo "Note: Individual projects may require additional setup."
echo "See README.md for project-specific instructions."
echo ""
