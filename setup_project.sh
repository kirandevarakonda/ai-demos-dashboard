#!/bin/bash

echo "========================================"
echo "AI Demos - Project Setup Helper"
echo "========================================"
echo ""

if [ -z "$1" ]; then
    echo "Usage: ./setup_project.sh <project-directory>"
    echo ""
    echo "Available projects:"
    for dir in */; do
        # Skip special directories
        if [[ ! "$dir" =~ ^(templates|venv|__pycache__|.git)/ ]]; then
            echo "  - ${dir%/}"
        fi
    done
    exit 1
fi

PROJECT_DIR="$1"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Directory '$PROJECT_DIR' does not exist"
    exit 1
fi

cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PWD")
echo "📦 Setting up: $PROJECT_NAME"
echo ""

# Check for package.json (Node.js project)
if [ -f "package.json" ]; then
    echo "📥 Installing Node.js dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Node.js dependencies installed"
    else
        echo "❌ Failed to install Node.js dependencies"
        exit 1
    fi
fi

# Check for requirements.txt (Python project)
if [ -f "requirements.txt" ]; then
    echo "📥 Installing Python dependencies..."
    
    # Check if we're in a virtual environment
    if [ -z "$VIRTUAL_ENV" ]; then
        echo "⚠️  Not in a virtual environment!"
        echo "   It's recommended to activate the virtual environment first:"
        echo "   source ../venv/bin/activate"
        read -p "   Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✅ Python dependencies installed"
    else
        echo "❌ Failed to install Python dependencies"
        exit 1
    fi
fi

# Check for backend directory
if [ -d "backend" ]; then
    echo ""
    echo "📁 Found backend directory"
    cd backend
    
    if [ -f "package.json" ]; then
        echo "📥 Installing backend Node.js dependencies..."
        npm install
        if [ $? -eq 0 ]; then
            echo "✅ Backend Node.js dependencies installed"
        else
            echo "❌ Failed to install backend Node.js dependencies"
            exit 1
        fi
    fi
    
    if [ -f "requirements.txt" ]; then
        echo "📥 Installing backend Python dependencies..."
        pip install -r requirements.txt
        if [ $? -eq 0 ]; then
            echo "✅ Backend Python dependencies installed"
        else
            echo "❌ Failed to install backend Python dependencies"
            exit 1
        fi
    fi
    
    cd ..
fi

echo ""
echo "========================================"
echo "✅ Project '$PROJECT_NAME' setup complete!"
echo "========================================"
echo ""
echo "To run this project, use the dashboard or see README.md"
echo ""
