# Automatic Insurance Form Filler

This project automates the extraction of insurance details from PDF documents and fills them into a professional insurance claim form using AI and browser automation.

## Features
- Extracts structured data from insurance PDFs using OpenAI GPT
- Fills a modern, web-based insurance claim form automatically using Playwright
- Supports a wide range of insurance fields
- User-friendly UI for both PDF upload and form review

---

## Prerequisites
- Python 3.8+
- [Node.js](https://nodejs.org/) (for Playwright browser installation)
- [Git](https://git-scm.com/)

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/insurance-form-filler.git
cd insurance-form-filler
```

### 2. Install Python Dependencies
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Install Playwright Browsers
```bash
playwright install
```

### 4. Set Up Environment Variables
Create a `.env` file in the project root with your OpenAI API key:
```
OPENAI_API_KEY=sk-...
```

### 5. Start the Local Web Server
This serves the HTML form at [http://localhost:8000/form.html](http://localhost:8000/form.html):
```bash
python server.py
```

### 6. Run the Streamlit App
In a new terminal (with the virtual environment activated):
```bash
streamlit run app.py
```

---

## Usage
1. Open the Streamlit app in your browser (usually at [http://localhost:8501](http://localhost:8501)).
2. Upload an insurance PDF document.
3. The app will extract details and display them.
4. The browser will open the insurance claim form and auto-fill the extracted details.
5. Review the form, make any corrections, and submit.

---

## File Structure
- `app.py` - Main Streamlit app for PDF upload, extraction, and automation
- `form.html` - Modern insurance claim form UI
- `server.py` - Simple HTTP server for serving the form and saving submissions
- `requirements.txt` - Python dependencies
- `.env` - Your OpenAI API key (not committed)

---

## Troubleshooting
- If Playwright browser does not launch, ensure you ran `playwright install` and have Node.js installed.
- If extraction fails, check your OpenAI API key and internet connection.
- For PDF extraction issues, ensure the PDF contains selectable text (not just images).

---

## License
MIT

---

## Credits
- [Streamlit](https://streamlit.io/)
- [Playwright](https://playwright.dev/python/)
- [OpenAI](https://openai.com/) 