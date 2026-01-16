# 🚀 Quick Start Guide

## 🐳 Option 1: Docker (Easiest - 1 Command!)

**If you have Docker installed:**

```bash
docker-compose up -d --build
```

Then open: **http://localhost:5000** ✅

That's it! Everything is set up automatically.

---

## 💻 Option 2: Local Setup (4 Steps)

Get the AI Demos Dashboard running locally in **4 simple steps**!

## Step 1: Run Setup Script

```bash
./setup.sh
```

This will set everything up automatically.

## Step 2: Activate Virtual Environment

```bash
source venv/bin/activate
```

## Step 3: Setup All Projects

```bash
./setup_all_projects.sh
```

This installs dependencies for all projects at once!

## Step 4: Start the Dashboard

```bash
python app.py
```

Then open your browser to: **http://localhost:5000**

---

## Setting Up Individual Projects

Before running a project from the dashboard, install its dependencies:

```bash
./setup_project.sh <project-name>
```

### Examples:

```bash
# For blockchain explorer
./setup_project.sh blockchain-explorer

# For AI summarizer
./setup_project.sh Summarizer_AI

# For medical blockchain app
./setup_project.sh MediChainAI
```

---

## That's It! 🎉

Now you can:
1. ✅ Start/stop projects from the dashboard
2. ✅ Open projects in your browser
3. ✅ Manage multiple AI demos from one place

For more details, see the full [README.md](README.md)
