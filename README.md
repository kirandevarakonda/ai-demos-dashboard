# AI Demos Dashboard

A unified web dashboard to manage and run multiple AI demo projects from a single interface.

## ✨ Features

- 🎯 **Single Dashboard**: Manage all your AI projects from one place
- 🚀 **Quick Launch**: Start/stop projects with a click
- 🔍 **Auto-Detection**: Automatically detects Node.js and Python projects
- ⚙️ **Configurable**: Customize project commands and URLs
- 🌐 **Direct Access**: Open each project in your browser directly from the dashboard

---

## 🐳 Docker Setup (Recommended for Easy Deployment)

**Want to run on any system with zero setup hassle?** Use Docker!

**⚠️ Important:** Set up your API keys first (see below)!

```bash
# 1. Setup environment variables
cp .env.example .env
# Edit .env and add your API keys

# 2. Build and start everything
docker-compose up -d --build
```

Then open: **http://localhost:5000**

👉 **[Full Docker Setup Guide](DOCKER_SETUP.md)**

---

## 🔑 API Keys Setup (Required!)

Many projects require API keys to function. Set them up before running:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys
nano .env  # or use your favorite editor
```

**Required API Keys:**
- **OPENAI_API_KEY** - For content-generator, Summarizer_AI, formfillingagent-browser
- **GEMINI_API_KEY** - For blockchain-explorer  
- **Firebase Config** - For content-generator authentication (6 variables)

👉 **[Complete API Keys Setup Guide](ENV_SETUP.md)** - How to get each key

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** (for Node.js-based projects)

### Step 1: Clone & Setup Dashboard

```bash
# Navigate to the project directory
cd ai-demos-dashboard

# Run the automated setup script
./setup.sh
```

That's it! The script will:
- ✅ Create a Python virtual environment
- ✅ Install all required Python packages
- ✅ Install Playwright browsers
- ✅ Verify your system has Python and Node.js

### Step 2: Setup All Projects (Recommended)

```bash
# Activate the virtual environment
source venv/bin/activate

# Setup all projects at once
./setup_all_projects.sh
```

This will install dependencies for all projects automatically!

**Or** setup individual projects:
```bash
./setup_project.sh <project-name>
```

### Step 3: Run the Dashboard

```bash
# Start the dashboard (venv should be active)
python app.py
```

Access the dashboard at: **http://localhost:5000**

### Check Setup Status Anytime

```bash
./check_status.sh
```

This shows which projects are ready to run!

---

## 📦 Setting Up Individual Projects

Each project needs its dependencies installed before it can run. You can do this in two ways:

### Option 1: Automated Setup (Recommended)

```bash
# Activate the virtual environment first
source venv/bin/activate

# Setup a specific project
./setup_project.sh <project-directory>

# Examples:
./setup_project.sh blockchain-explorer
./setup_project.sh MediChainAI
./setup_project.sh Summarizer_AI
```

### Option 2: Manual Setup

Navigate to the project directory and install dependencies:

**For Node.js projects:**
```bash
cd <project-directory>
npm install
```

**For Python projects:**
```bash
cd <project-directory>
pip install -r requirements.txt
```

---

## 📚 Available Projects

| Project | Type | Description |
|---------|------|-------------|
| `blockchain-explorer` | Node.js | Blockchain exploration and visualization |
| `content-generator` | Node.js + Python | AI-powered content generation tool |
| `MediChainAI` | Node.js | Medical blockchain application |
| `multiagentchatbot` | Node.js | Multi-agent conversational AI |
| `formfillingagent-browser` | Python/Streamlit | Automated form filling agent |
| `Summarizer_AI` | Python/Streamlit | AI text summarization tool |
| `Maskdata` | Python/Streamlit | Data masking and privacy tool |
| `Linkedin_lead_generator` | Python | LinkedIn automation tool |

---

## ⚙️ Configuration

Projects are configured via `dashboard_config.json`. Each project can specify:

- `command`: Single command to run the project
- `commands`: Multiple commands to run sequentially
- `url`: The local URL where the project will be accessible

### Example Configuration

```json
{
  "blockchain-explorer": {
    "command": "npm run dev",
    "url": "http://localhost:5173/"
  },
  "Summarizer_AI": {
    "command": "streamlit run app.py",
    "url": "http://localhost:8501/"
  }
}
```

### Auto-Detection

If a project isn't in the config, the dashboard will auto-detect:
- **Node.js projects** (has `package.json`) → runs `npm run dev`
- **Python projects** (has `.py` files) → runs `streamlit run <first_py_file>`

---

## 🏗️ Architecture

The dashboard is a Flask application that:

- **Scans** subdirectories to detect projects
- **Manages** project processes using Python's `subprocess` module
- **Runs** projects concurrently using threading
- **Serves** a web UI to control everything

### Tech Stack
- **Backend**: Flask (Python)
- **Process Management**: subprocess, threading, psutil
- **Configuration**: JSON-based

---

## 🛠️ Development

### Adding a New Project

1. Place your project in a subdirectory of `ai-demos-dashboard/`
2. (Optional) Add custom configuration to `dashboard_config.json`
3. Refresh the dashboard - it will auto-detect!

### Project Requirements

Your project should:
- Have either `package.json` (Node.js) or Python files
- Include a way to start a dev server
- (Optional) Run on a specific port

---

## 📖 Project-Specific Setup Details

<details>
<summary><b>blockchain-explorer</b></summary>

```bash
cd blockchain-explorer
npm install
npm run dev
```
Access at: http://localhost:5173/
</details>

<details>
<summary><b>content-generator</b></summary>

**Frontend:**
```bash
cd content-generator
npm install
npm run dev
```

**Backend:**
```bash
cd content-generator/backend
npm install
pip install -r requirements.txt
npm start
```
Access at: http://localhost:8080/
</details>

<details>
<summary><b>MediChainAI</b></summary>

```bash
cd MediChainAI
npm install
npm run dev
```
Access at: http://localhost:5001/
</details>

<details>
<summary><b>multiagentchatbot</b></summary>

```bash
cd multiagentchatbot
npm install
npm run dev
```
Access at: http://localhost:8081/
</details>

<details>
<summary><b>formfillingagent-browser</b></summary>

```bash
cd formfillingagent-browser
pip install -r requirements.txt
streamlit run app.py --server.port 8507
```
Access at: http://localhost:8507/
</details>

<details>
<summary><b>Summarizer_AI</b></summary>

```bash
cd Summarizer_AI
pip install -r requirements.txt
streamlit run app.py
```
Access at: http://localhost:8501/
</details>

<details>
<summary><b>Maskdata</b></summary>

```bash
cd Maskdata
pip install -r requirements.txt
streamlit run app.py
```
Access at: http://localhost:8501/
</details>

<details>
<summary><b>Linkedin_lead_generator</b></summary>

```bash
cd Linkedin_lead_generator
pip install -r requirements.txt
python linkedin_connect_browseruse.py
```
</details>

---

## 🐛 Troubleshooting

### Virtual Environment Not Activating
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Port Already in Use
If a project fails to start due to port conflicts:
1. Stop any other processes using that port
2. Or change the port in `dashboard_config.json`

### Permission Denied on Scripts
```bash
chmod +x setup.sh setup_project.sh
```

### Playwright Installation Issues
```bash
# Activate venv first
source venv/bin/activate

# Then install browsers
playwright install
```

---

## 📝 License

This project and its sub-projects may have different licenses. Check individual project directories for specific license information.

## 🤝 Contributing

1. Add your AI demo project as a subdirectory
2. Include a `package.json` or `requirements.txt`
3. (Optional) Add configuration to `dashboard_config.json`
4. Submit a pull request!

---

**Happy Building! 🚀**