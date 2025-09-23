# AI Project Dashboard

## Overview

This is a simple Flask-based web dashboard designed to help manage and run various AI projects located in subdirectories. It automatically detects projects and allows you to start and stop them via a web interface.

## Architecture

The dashboard is a single-file Flask application (`app.py`). It uses the following components:

- **Flask**: The web framework to serve the dashboard.
- **subprocess**: To run project commands in separate processes.
- **threading**: To run multiple project processes concurrently without blocking the main Flask application thread.
- **signal**: To handle stopping processes gracefully.
- **json**: To load project configurations from `dashboard_config.json`.

Projects are detected by scanning subdirectories within the dashboard's directory. The dashboard attempts to auto-detect commands for Node.js (`package.json`) and Python (`.py` files) projects, but this can be overridden or extended using a configuration file.

## How to Run

1.  **Navigate** to the `aidashboard` directory in your terminal.
    ```bash
    cd /path/to/your/aidashboard
    ```
2.  **Create a virtual environment** (recommended):
    -   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
    -   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
3.  **Install dependencies one by one**: Install each package listed in `requirements.txt` individually.
    ```bash
    pip install Flask
    pip install psutil
    pip install langchain_openai
    pip install browser_use
    pip install python-dotenv
    pip install pandas
    pip install streamlit
    pip install PyPDF2
    pip install xlsxwriter
    pip install pdfplumber
    pip install playwright
    pip install openai
    ```
4.  **Run the application**: Execute the `app.py` file.

    ```bash
    python app.py
    ```

5.  **Access the dashboard**: Open your web browser and go to `http://localhost:5000/`.

## Configuration (`dashboard_config.json`)

You can customize project detection and execution using the `dashboard_config.json` file in the `aidashboard` directory.

This JSON file is a dictionary where keys are project directory names and values are configuration objects for that project.

Example:

```json
{
  "my_project": {
    "commands": ["command1 arg1", "command2"],
    "url": "http://localhost:8000/"
  },
  "another_project": {
    "command": "single_command",
    "url": "http://localhost:8501/"
  }
}
```

-   `commands`: A list of commands to run for the project. These commands will be executed sequentially in the project's directory.
-   `command`: A single command to run (alternative to `commands`).
-   `url`: The URL where the project's application can be accessed (used for the "Open in App" link in the dashboard UI).

If a project directory name exists as a key in `dashboard_config.json`, the dashboard will use the `commands` or `command` specified there instead of attempting auto-detection.

## Project Detection Logic

1.  Iterates through subdirectories in the dashboard's root.
2.  For each subdirectory (project):
    -   Checks if the project name exists as a key in `dashboard_config.json`.
    -   If yes, it uses the `commands` or `command` specified in the config.
    -   If no, it attempts to auto-detect:
        -   Checks for `package.json` (Node.js) and suggests `npm run dev`.
        -   Checks for `.py` files (Python) and suggests `streamlit run <first_py_file>`.
    -   Retrieves an optional `url` from `dashboard_config.json`.