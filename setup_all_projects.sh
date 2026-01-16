#!/bin/bash

echo "========================================"
echo "AI Demos - Setup All Projects"
echo "========================================"
echo ""

# Check if we're in a virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Virtual environment not active!"
    echo "   Activating virtual environment..."
    if [ -d "venv" ]; then
        source venv/bin/activate
    else
        echo "❌ Virtual environment not found. Run ./setup.sh first."
        exit 1
    fi
fi

SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

# Function to setup a project
setup_project() {
    local project_dir=$1
    local project_name=$(basename "$project_dir")
    
    # Skip non-project directories
    if [[ "$project_name" == "templates" || "$project_name" == "venv" || "$project_name" == "." || "$project_name" == ".." || "$project_name" == ".git" || "$project_name" == "__pycache__" ]]; then
        return
    fi
    
    if [ ! -d "$project_dir" ]; then
        return
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Setting up: $project_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$project_dir" || return
    
    local has_setup=false
    
    # Check for package.json (Node.js project)
    if [ -f "package.json" ]; then
        if [ -d "node_modules" ]; then
            echo "⏭️  Node.js dependencies already installed (skipping)"
            SKIP_COUNT=$((SKIP_COUNT + 1))
        else
            echo "📥 Installing Node.js dependencies..."
            if npm install; then
                echo "✅ Node.js dependencies installed"
                has_setup=true
                SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            else
                echo "❌ Failed to install Node.js dependencies"
                FAIL_COUNT=$((FAIL_COUNT + 1))
                cd - > /dev/null
                return
            fi
        fi
    fi
    
    # Check for requirements.txt (Python project)
    if [ -f "requirements.txt" ]; then
        echo "📥 Installing Python dependencies..."
        if pip install -q -r requirements.txt; then
            echo "✅ Python dependencies installed"
            has_setup=true
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo "❌ Failed to install Python dependencies"
            FAIL_COUNT=$((FAIL_COUNT + 1))
            cd - > /dev/null
            return
        fi
    fi
    
    # Check for backend directory
    if [ -d "backend" ]; then
        echo "📁 Found backend directory"
        cd backend || return
        
        if [ -f "package.json" ]; then
            echo "📥 Installing backend Node.js dependencies..."
            if npm install; then
                echo "✅ Backend Node.js dependencies installed"
                has_setup=true
            else
                echo "❌ Failed to install backend Node.js dependencies"
                FAIL_COUNT=$((FAIL_COUNT + 1))
            fi
        fi
        
        if [ -f "requirements.txt" ]; then
            echo "📥 Installing backend Python dependencies..."
            if pip install -q -r requirements.txt; then
                echo "✅ Backend Python dependencies installed"
                has_setup=true
            else
                echo "❌ Failed to install backend Python dependencies"
                FAIL_COUNT=$((FAIL_COUNT + 1))
            fi
        fi
        
        cd ..
    fi
    
    if [ "$has_setup" = false ]; then
        echo "⚠️  No setup needed (no package.json or requirements.txt found)"
        SKIP_COUNT=$((SKIP_COUNT + 1))
    fi
    
    cd - > /dev/null
}

# Setup all subdirectories
for dir in */; do
    if [[ ! "$dir" =~ ^(venv|templates|__pycache__|.git|node_modules)/ ]]; then
        setup_project "$dir"
    fi
done

echo ""
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "📊 Summary:"
echo "  ✅ Successfully setup: $SUCCESS_COUNT"
echo "  ⏭️  Skipped (already setup): $SKIP_COUNT"
echo "  ❌ Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
    echo "⚠️  Some projects failed to setup. Check the output above for details."
    echo ""
fi

echo "To start the dashboard:"
echo "  python app.py"
echo ""
echo "Then open your browser to: http://localhost:5000"
echo ""
