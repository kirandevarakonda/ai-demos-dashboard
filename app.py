import os
import json
from flask import Flask, render_template, request, redirect, url_for, jsonify
import subprocess
import threading
import signal

app = Flask(__name__)

# Store running processes
processes = {}

# Load dashboard config
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'dashboard_config.json')
if os.path.exists(CONFIG_PATH):
    with open(CONFIG_PATH) as f:
        DASHBOARD_CONFIG = json.load(f)
else:
    DASHBOARD_CONFIG = {}

def detect_projects(base_path):
    projects = []
    for name in os.listdir(base_path):
        path = os.path.join(base_path, name)
        if os.path.isdir(path):
            # Exclude 'templates' and '.git' directories
            if name in ['templates', '.git']:
                continue
            config = DASHBOARD_CONFIG.get(name, {})
            # Check if project is in config and use specified commands, otherwise auto-detect
            if name in DASHBOARD_CONFIG:
                if 'commands' in config:
                    commands = config['commands']
                elif 'command' in config:
                    commands = [config['command']]
                else:
                    # Project is in config but no command specified, default to empty list
                    commands = []
                print(f"Debug: Detected commands for project {name}: {commands}") # Debug print
            else:
                # Node.js project
                if os.path.exists(os.path.join(path, 'package.json')):
                    commands = ['npm run dev']
                else:
                    py_files = [f for f in os.listdir(path) if f.endswith('.py')]
                    if py_files:
                        commands = [f'streamlit run {py_files[0]}']
                    else:
                        commands = []
            url = config.get('url')
            projects.append({
                'name': name,
                'type': 'custom' if name in DASHBOARD_CONFIG else 'auto',
                'path': path,
                'commands': commands,
                'url': url
            })
    return projects

@app.route('/')
def index():
    base_path = os.path.abspath(os.path.dirname(__file__))
    projects = detect_projects(base_path)
    return render_template('index.html', projects=projects, processes=processes)

@app.route('/start/<project_name>', methods=['POST'])
def start_project(project_name):
    base_path = os.path.abspath(os.path.dirname(__file__))
    projects = detect_projects(base_path)
    project = next((p for p in projects if p['name'] == project_name), None)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    if project_name in processes:
        return jsonify({'error': 'Already running'}), 400
    procs = []
    def run():
        for cmd in project['commands']:
            proc = subprocess.Popen(cmd, cwd=project['path'], shell=True, preexec_fn=os.setsid)
            procs.append(proc)
        processes[project_name] = procs
        for proc in procs:
            proc.wait()
        processes.pop(project_name, None)
    thread = threading.Thread(target=run)
    thread.start()
    return jsonify({'status': 'started'})

@app.route('/stop/<project_name>', methods=['POST'])
def stop_project(project_name):
    procs = processes.get(project_name)
    if not procs:
        return jsonify({'error': 'Not running'}), 400
    for proc in procs:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    processes.pop(project_name, None)
    return jsonify({'status': 'stopped'})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 