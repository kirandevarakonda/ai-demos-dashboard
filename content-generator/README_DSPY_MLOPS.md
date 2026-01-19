# Content Generator with DSPy Optimization + MLOps Monitoring

An advanced AI-powered content generation platform featuring **DSPy prompt optimization** and comprehensive **MLOps monitoring**.

## 🚀 New Features

### DSPy Prompt Optimization
- **Automatic Prompt Engineering**: Uses DSPy's Chain of Thought reasoning for better quality
- **A/B Testing**: Compare manual prompts vs DSPy-optimized prompts
- **Quality Metrics**: Real-time tracking of SEO, readability, and relevance scores

### MLOps Monitoring & Analytics
- **Real-time Metrics**: Track latency, costs, token usage, and success rates
- **Performance Comparison**: Analyze manual vs optimized prompt performance
- **Cost Tracking**: Monitor API costs per endpoint and overall spending
- **Quality Dashboard**: View SEO scores, readability, and content quality metrics
- **Historical Analysis**: Track performance trends over time
- **A/B Test Results**: Data-driven recommendations on prompt versions

## 📊 What Gets Tracked

### Performance Metrics
- ⏱️ **Latency**: Response time for each API call
- 💰 **Cost**: Estimated API costs (based on token usage)
- 📈 **Success Rate**: % of successful vs failed calls
- 🎯 **Token Usage**: Average tokens per endpoint

### Quality Metrics
- 🔍 **SEO Score**: Keyword density and optimization
- 📖 **Readability Score**: Content clarity and structure
- 🎓 **Relevance Score**: Input-output alignment
- ⭐ **Overall Score**: Combined quality metric

### Comparison Analytics
- 📊 Manual prompts vs DSPy-optimized prompts
- 🏆 Performance winner recommendations
- 📉 Cost-benefit analysis

## 🛠️ Tech Stack

### Enhanced Stack
- **DSPy**: Automatic prompt optimization framework
- **SQLite**: Metrics database
- **SQLAlchemy**: ORM for database operations
- **Prometheus-style metrics**: Standard observability format

### Original Stack
- React 18 + TypeScript + Vite
- Node.js + Express
- Python + OpenAI API
- Tailwind CSS + Shadcn UI

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
pip install -r requirements.txt
```

### 2. Setup Environment Variables

Create `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 3. Run the Backend Server

```bash
cd backend
node server.js
```

The server will run on `http://localhost:3001`

### 4. Run the Frontend (in a new terminal)

```bash
cd content-generator
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📡 New API Endpoints

### Content Generation (Enhanced)

All generation endpoints now support the `useDspy` parameter:

```bash
# Generate keywords with DSPy optimization (default)
POST /api/keywords
{
  "seedKeyword": "artificial intelligence",
  "useDspy": true
}

# Generate with manual prompts for comparison
POST /api/keywords
{
  "seedKeyword": "artificial intelligence",
  "useDspy": false
}
```

**Response includes metrics and quality scores:**
```json
{
  "keywords": ["machine learning", "neural networks", ...],
  "metrics": {
    "latency_ms": 1234.56,
    "tokens_used": 150,
    "prompt_version": "dspy-optimized"
  },
  "quality": {
    "seo_score": 0.85,
    "readability_score": 0.92,
    "relevance_score": 0.88,
    "overall_score": 0.88
  }
}
```

### MLOps Monitoring Endpoints

#### Get Overall Metrics
```bash
GET /api/metrics
```

**Response:**
```json
{
  "overall": {
    "total_calls": 150,
    "total_cost_usd": 0.2456,
    "avg_latency_ms": 1234.56,
    "success_rate_pct": 98.5
  },
  "by_endpoint": [
    {
      "endpoint": "keywords",
      "call_count": 50,
      "avg_latency_ms": 1100.45,
      "total_cost_usd": 0.0823,
      "avg_tokens": 120
    }
  ],
  "quality_scores": {
    "avg_seo_score": 0.75,
    "avg_readability_score": 0.82,
    "avg_relevance_score": 0.79,
    "avg_overall_score": 0.79
  }
}
```

#### Compare Prompt Versions
```bash
GET /api/metrics/comparison
```

**Response:**
```json
{
  "comparison": [
    {
      "endpoint": "keywords",
      "prompt_version": "dspy-optimized",
      "call_count": 30,
      "avg_latency_ms": 1200.34,
      "avg_cost_usd": 0.0016,
      "quality": {
        "avg_seo_score": 0.85,
        "avg_readability_score": 0.90,
        "avg_relevance_score": 0.88,
        "avg_overall_score": 0.88
      }
    },
    {
      "endpoint": "keywords",
      "prompt_version": "manual",
      "call_count": 20,
      "avg_latency_ms": 980.12,
      "avg_cost_usd": 0.0014,
      "quality": {
        "avg_overall_score": 0.75
      }
    }
  ],
  "summary": {
    "dspy_advantages": [
      "keywords: +13.0% quality"
    ],
    "recommendation": "DSPy optimization recommended for better quality"
  }
}
```

#### Get Metrics History
```bash
GET /api/metrics/history?hours=24
```

## 💡 How DSPy Improves Prompts

### Manual Prompt (Basic)
```python
"Generate 3 SEO-optimized titles. Return only the titles, one per line."
```

### DSPy-Optimized (Chain of Thought)
```python
class TitleGeneration(dspy.Signature):
    """Generate SEO-optimized article titles."""
    keyword = dspy.InputField(desc="The target keyword for SEO optimization")
    titles = dspy.OutputField(desc="3 professional, engaging, SEO-optimized titles")

# DSPy automatically adds reasoning steps for better quality
```

**Benefits:**
- ✅ Better structured prompts
- ✅ Automatic reasoning chains
- ✅ Consistent output format
- ✅ Higher quality scores

## 📊 MLOps Dashboard (Future Enhancement)

A visual dashboard is planned to display:
- Real-time metrics charts
- Cost tracking graphs
- Quality score trends
- Prompt comparison visualizations
- Alert thresholds for anomalies

## 🧪 A/B Testing Workflow

1. **Generate content with both versions:**
   - Send requests with `useDspy: true`
   - Send requests with `useDspy: false`

2. **Compare results:**
   - Call `GET /api/metrics/comparison`
   - Review quality scores and performance

3. **Make data-driven decisions:**
   - Use recommended prompt version
   - Optimize based on metrics

## 📈 Monitoring Best Practices

1. **Track costs regularly** to avoid unexpected API bills
2. **Monitor quality scores** to ensure content standards
3. **Compare prompt versions** before deploying new prompts
4. **Set up alerts** for latency spikes or quality drops (future feature)
5. **Review metrics weekly** to identify optimization opportunities

## 🗄️ Database Schema

### Tables Created Automatically

#### `llm_metrics`
- Stores every LLM API call
- Includes: timestamp, endpoint, prompt_version, tokens, latency, cost, success

#### `quality_metrics`
- Stores content quality scores
- Includes: seo_score, readability_score, relevance_score, overall_score

#### `prompt_versions`
- Tracks different prompt variants
- Includes: version_name, template, avg_quality_score, total_calls

Database file: `backend/mlops_data.db` (SQLite)

## 🎯 Success Metrics

After implementing DSPy + MLOps:
- 📈 **Quality**: Expect 10-20% improvement in overall scores
- ⚡ **Insights**: Full visibility into system performance
- 💰 **Cost Control**: Track and optimize API spending
- 🔬 **Experimentation**: Data-driven prompt improvements

## 🚨 Troubleshooting

### Database not created
```bash
cd backend
python -c "from mlops_config import Base, engine; Base.metadata.create_all(engine)"
```

### DSPy not working
```bash
pip install dspy-ai --upgrade
```

### Metrics not showing
- Generate some content first to populate the database
- Check `backend/mlops_data.db` exists
- Verify Python backend is running

## 📚 Learn More

- [DSPy Documentation](https://dspy-docs.vercel.app/)
- [OpenAI API Pricing](https://openai.com/pricing)
- [MLOps Best Practices](https://ml-ops.org/)

## 🎉 What Makes This Special

This isn't just a content generator - it's a **production-ready AI platform** that demonstrates:

✅ **DSPy** - Modern prompt engineering  
✅ **MLOps** - Professional monitoring and observability  
✅ **A/B Testing** - Data-driven optimization  
✅ **Cost Tracking** - Financial accountability  
✅ **Quality Metrics** - Measurable improvements  
✅ **Scalability** - Ready for production deployment  

Perfect for showcasing **advanced AI engineering skills** in your portfolio! 🚀
