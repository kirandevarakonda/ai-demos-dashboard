#!/bin/bash

echo "========================================"
echo "AI Demos Dashboard - Setup Status"
echo "========================================"
echo ""

# Check dashboard status
echo "📊 Dashboard Status:"
echo "-------------------"

if [ -d "venv" ]; then
    echo "✅ Virtual environment exists"
else
    echo "❌ Virtual environment not found - Run ./setup.sh"
fi

if [ -f "venv/bin/python" ]; then
    source venv/bin/activate
    if python -c "import flask" 2>/dev/null; then
        echo "✅ Flask is installed"
    else
        echo "❌ Flask not installed - Run ./setup.sh"
    fi
fi

echo ""
echo "📦 Project Setup Status:"
echo "------------------------"

# Function to check project status
check_project() {
    local project_dir=$1
    local project_name=$(basename "$project_dir")
    
    # Skip non-project directories
    if [[ "$project_name" == "templates" || "$project_name" == "venv" || "$project_name" == "." || "$project_name" == ".."  || "$project_name" == ".git" ]]; then
        return
    fi
    
    if [ ! -d "$project_dir" ]; then
        return
    fi
    
    local has_package_json=false
    local has_requirements=false
    local has_node_modules=false
    local has_python_deps=false
    local status="⚠️  Not Setup"
    
    # Check if it's a Node.js project
    if [ -f "$project_dir/package.json" ]; then
        has_package_json=true
        if [ -d "$project_dir/node_modules" ]; then
            has_node_modules=true
        fi
    fi
    
    # Check if it's a Python project
    if [ -f "$project_dir/requirements.txt" ]; then
        has_requirements=true
        # This is a simplification - we can't easily check if pip packages are installed
        has_python_deps=true
    fi
    
    # Determine status
    if [ "$has_package_json" = true ] && [ "$has_node_modules" = true ]; then
        status="✅ Ready"
    elif [ "$has_requirements" = true ]; then
        status="✅ Ready (Python)"
    elif [ "$has_package_json" = true ]; then
        status="❌ Needs: npm install"
    elif [ -f "$project_dir"/*.py ]; then
        status="⚠️  Python project (no requirements.txt)"
    fi
    
    printf "%-30s %s\n" "$project_name" "$status"
}

# Check all subdirectories
for dir in */; do
    if [[ ! "$dir" =~ ^(venv|templates|__pycache__|.git|node_modules)/ ]]; then
        check_project "$dir"
    fi
done

echo ""
echo "========================================"
echo "🔧 Quick Actions:"
echo "========================================"
echo ""
echo "To setup a specific project:"
echo "  ./setup_project.sh <project-name>"
echo ""
echo "To setup all projects at once:"
echo "  ./setup_all_projects.sh"
echo ""
echo "To start the dashboard:"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
