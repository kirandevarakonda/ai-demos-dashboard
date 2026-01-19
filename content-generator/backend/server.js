const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Helper function to run Python scripts
function runPythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error('Python Error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python Process Exit Code:', code);
        console.error('Python Error Output:', error);
        reject(new Error(`Python script failed with code ${code}: ${error}`));
      } else {
        try {
          const parsedResult = JSON.parse(result);
          if (parsedResult.error) {
            reject(new Error(parsedResult.error));
          } else {
            resolve(parsedResult);
          }
        } catch (e) {
          console.error('Parse Error:', e);
          reject(new Error(`Failed to parse Python script output: ${e.message}`));
        }
      }
    });
  });
}

// API endpoints with DSPy optimization support
app.post('/api/keywords', async (req, res) => {
  try {
    const { seedKeyword, useDspy = true } = req.body;
    if (!seedKeyword) {
      return res.status(400).json({ error: 'Seed keyword is required' });
    }

    const result = await runPythonScript(
      path.join(__dirname, 'llm_service_enhanced.py'),
      ['generate_keywords', seedKeyword, String(useDspy)]
    );
    res.json(result);
  } catch (error) {
    console.error('Error generating keywords:', error);
    res.status(500).json({ error: error.message || 'Failed to generate keywords' });
  }
});

app.post('/api/titles', async (req, res) => {
  try {
    const { keyword, useDspy = true } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const result = await runPythonScript(
      path.join(__dirname, 'llm_service_enhanced.py'),
      ['generate_titles', keyword, String(useDspy)]
    );
    res.json(result);
  } catch (error) {
    console.error('Error generating titles:', error);
    res.status(500).json({ error: error.message || 'Failed to generate titles' });
  }
});

app.post('/api/topics', async (req, res) => {
  try {
    const { title, useDspy = true } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await runPythonScript(
      path.join(__dirname, 'llm_service_enhanced.py'),
      ['generate_topics', title, String(useDspy)]
    );
    res.json(result);
  } catch (error) {
    console.error('Error generating topics:', error);
    res.status(500).json({ error: error.message || 'Failed to generate topics' });
  }
});

app.post('/api/content', async (req, res) => {
  try {
    const { topic, useDspy = true } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await runPythonScript(
      path.join(__dirname, 'llm_service_enhanced.py'),
      ['generate_content', topic, String(useDspy)]
    );
    res.json(result);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

// MLOps Monitoring Endpoints
app.get('/api/metrics', async (req, res) => {
  try {
    const result = await runPythonScript(
      path.join(__dirname, 'mlops_monitoring.py'),
      ['get_metrics']
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch metrics' });
  }
});

app.get('/api/metrics/comparison', async (req, res) => {
  try {
    const result = await runPythonScript(
      path.join(__dirname, 'mlops_monitoring.py'),
      ['compare_prompts']
    );
    res.json(result);
  } catch (error) {
    console.error('Error comparing prompts:', error);
    res.status(500).json({ error: error.message || 'Failed to compare prompts' });
  }
});

app.get('/api/metrics/history', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const result = await runPythonScript(
      path.join(__dirname, 'mlops_monitoring.py'),
      ['get_history', String(hours)]
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch history' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`MLOps monitoring available at http://localhost:${port}/api/metrics`);
  });
}

// Export the Express API for Vercel
module.exports = app;