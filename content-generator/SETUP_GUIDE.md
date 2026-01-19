# Enhanced Content Generator - Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Python Dependencies

```bash
cd content-generator/backend
pip install -r requirements.txt
```

This will install:
- `openai` - OpenAI API client
- `dspy-ai` - DSPy prompt optimization framework
- `sqlalchemy` - Database ORM
- `python-dotenv` - Environment variables
- `prometheus-client` - Metrics export
- `pandas` & `numpy` - Data analysis

### 2. Setup Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
NODE_ENV=development
```

### 3. Initialize the Database

The database will be created automatically when you first run the backend. To manually initialize:

```bash
cd backend
python3 -c "from mlops_config import Base, engine; Base.metadata.create_all(engine); print('Database initialized!')"
```

This creates `mlops_data.db` with three tables:
- `llm_metrics` - API call tracking
- `quality_metrics` - Content quality scores
- `prompt_versions` - Prompt A/B test data

### 4. Start the Backend Server

```bash
cd backend
npm install  # If you haven't already
node server.js
```

You should see:
```
Server running on port 3001
MLOps monitoring available at http://localhost:3001/api/metrics
```

### 5. Test the Setup

Open a new terminal and test the API:

```bash
# Test basic metrics endpoint
curl http://localhost:3001/api/metrics

# Test content generation with DSPy
curl -X POST http://localhost:3001/api/keywords \
  -H "Content-Type: application/json" \
  -d '{"seedKeyword": "artificial intelligence", "useDspy": true}'
```

### 6. Start the Frontend

```bash
cd content-generator  # Back to root
npm install
npm run dev
```

Frontend will be at: `http://localhost:5173`

## 🎯 Testing DSPy vs Manual Prompts

### Generate with DSPy (Optimized)
```bash
curl -X POST http://localhost:3001/api/keywords \
  -H "Content-Type: application/json" \
  -d '{"seedKeyword": "machine learning", "useDspy": true}'
```

### Generate with Manual Prompts
```bash
curl -X POST http://localhost:3001/api/keywords \
  -H "Content-Type: application/json" \
  -d '{"seedKeyword": "machine learning", "useDspy": false}'
```

### Compare Results
```bash
curl http://localhost:3001/api/metrics/comparison
```

## 📊 View Monitoring Dashboard

Once you've generated some content, view the metrics:

1. **Overall Metrics**: `GET http://localhost:3001/api/metrics`
2. **Prompt Comparison**: `GET http://localhost:3001/api/metrics/comparison`
3. **History (24h)**: `GET http://localhost:3001/api/metrics/history?hours=24`

## 🐛 Troubleshooting

### "Module 'dspy' not found"
```bash
pip install dspy-ai --upgrade
```

### "Database locked" error
```bash
rm backend/mlops_data.db
# Restart the backend server
```

### "OpenAI API key not found"
- Make sure `.env` file exists in the `backend` directory
- Check that `OPENAI_API_KEY` is set correctly
- No quotes needed around the API key

### Port 3001 already in use
Change the port in `backend/.env`:
```env
PORT=3002
```

And update `VITE_API_URL` in frontend `.env`:
```env
VITE_API_URL=http://localhost:3002
```

## 🎓 Understanding the Files

### Backend Files

| File | Purpose |
|------|---------|
| `llm_service_enhanced.py` | Main LLM service with monitoring |
| `dspy_optimized_service.py` | DSPy-powered optimized prompts |
| `mlops_config.py` | Database models and configuration |
| `mlops_monitoring.py` | Analytics and metrics aggregation |
| `server.js` | Express API server |

### Database Schema

#### `llm_metrics` table
Tracks every API call with:
- Timestamp, endpoint, prompt version
- Input/output text
- Tokens, latency, cost
- Success status

#### `quality_metrics` table
Content quality scores:
- SEO score (keyword optimization)
- Readability score (sentence structure)
- Relevance score (input-output alignment)
- Overall score (combined)

## 🚀 Next Steps

1. **Generate Some Content**: Use the web UI to generate keywords, titles, topics, and content
2. **View Metrics**: Check the monitoring dashboard
3. **Compare Versions**: Test manual vs DSPy prompts
4. **Analyze Quality**: Review quality scores and make improvements

## 📈 Production Deployment

For production deployment:

1. **Use PostgreSQL** instead of SQLite (update `mlops_config.py`)
2. **Add proper logging** (Winston for Node.js, logging for Python)
3. **Set up alerts** for cost thresholds and quality drops
4. **Enable HTTPS** with proper SSL certificates
5. **Add authentication** to protect monitoring endpoints
6. **Scale horizontally** with load balancers

## 💡 Tips

- Start with DSPy enabled to see quality improvements
- Check metrics after every 10-20 calls for meaningful stats
- Monitor costs to avoid unexpected API bills
- Use quality scores to iterate on prompts
- A/B test before changing prompt versions in production

---

**Ready to optimize your AI content generation! 🎉**
