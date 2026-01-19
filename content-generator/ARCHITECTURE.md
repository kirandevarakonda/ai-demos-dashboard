```
┌─────────────────────────────────────────────────────────────────────┐
│                   Content Generator Architecture                     │
│                      with DSPy + MLOps                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   React Frontend        │
│   (Port 5173)           │
│                         │
│  - User Input Form      │
│  - Content Display      │
│  - Metrics Dashboard    │
│  - Quality Scores       │
└───────────┬─────────────┘
            │
            │ API Calls
            │ (POST /api/keywords, titles, topics, content)
            │ (GET /api/metrics, comparison, history)
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Express Server (Node.js)                          │
│                        (Port 3001)                                  │
│                                                                     │
│  Endpoints:                                                         │
│  ✓ POST /api/keywords    ──┐                                       │
│  ✓ POST /api/titles        │ → Python LLM Service                  │
│  ✓ POST /api/topics        │   (with DSPy flag)                    │
│  ✓ POST /api/content     ──┘                                       │
│                                                                     │
│  ✓ GET /api/metrics      ──┐                                       │
│  ✓ GET /api/metrics/comparison │ → Python MLOps Monitoring         │
│  ✓ GET /api/metrics/history ───┘                                   │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 │ Spawn Python Process
                 │
┌────────────────▼────────────────────────────────────────────────────┐
│              Python Backend Services                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  llm_service_enhanced.py                                 │     │
│  │  Main orchestrator with monitoring                       │     │
│  │                                                           │     │
│  │  if useDspy == true:                                    │     │
│  │    ┌──────────────────────────────────────┐             │     │
│  │    │  dspy_optimized_service.py           │             │     │
│  │    │                                       │             │     │
│  │    │  DSPy Modules:                       │             │     │
│  │    │  • KeywordGenerator                  │             │     │
│  │    │  • TitleGenerator                    │             │     │
│  │    │  • TopicGenerator        ┌──────────┼─────────┐   │     │
│  │    │  • ContentGenerator       │ OpenAI   │         │   │     │
│  │    │                           │ GPT-3.5  │         │   │     │
│  │    │  Uses Chain of Thought    │  API     │         │   │     │
│  │    │  for better reasoning ────▶          │         │   │     │
│  │    └───────────────────────────└──────────┘         │   │     │
│  │  else:                                               │   │     │
│  │    Manual prompts ────────────────────────────────────┘   │     │
│  │                                                           │     │
│  │  Then:                                                    │     │
│  │  • Calculate quality metrics                             │     │
│  │  • Log to database                                       │     │
│  │  • Return results with metrics                           │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  mlops_config.py                                         │     │
│  │                                                           │     │
│  │  Database Models:                                        │     │
│  │  • LLM Metrics (calls, tokens, cost, latency)           │     │
│  │  • Quality Metrics (SEO, readability, relevance)        │     │
│  │  • Prompt Versions (for A/B testing)                    │     │
│  │                                                           │     │
│  │  Functions:                                              │     │
│  │  • log_llm_call()                                       │     │
│  │  • log_quality_metric()                                 │     │
│  │  • calculate_cost()                                     │     │
│  └──────────────┬───────────────────────────────────────────┘     │
│                 │                                                  │
│                 ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  mlops_monitoring.py                                     │     │
│  │                                                           │     │
│  │  Analytics Functions:                                    │     │
│  │  • get_overall_metrics()                                │     │
│  │  • compare_prompt_versions()                            │     │
│  │  • get_metrics_history()                                │     │
│  │  • calculate_comparison_summary()                       │     │
│  └──────────────┬───────────────────────────────────────────┘     │
└─────────────────┼──────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SQLite Database                                │
│                     (mlops_data.db)                                 │
│                                                                     │
│  Tables:                                                            │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │  llm_metrics        │  │ quality_metrics  │  │ prompt_versions││
│  │                     │  │                  │  │                ││
│  │ • id                │  │ • id             │  │ • id           ││
│  │ • timestamp         │  │ • llm_metric_id  │  │ • endpoint     ││
│  │ • endpoint          │  │ • seo_score      │  │ • version_name ││
│  │ • prompt_version    │  │ • readability    │  │ • is_active    ││
│  │ • tokens_used       │  │ • relevance      │  │ • avg_quality  ││
│  │ • latency_ms        │  │ • overall_score  │  │ • total_calls  ││
│  │ • cost_usd          │  │                  │  │                ││
│  │ • success           │  │                  │  │                ││
│  └─────────────────────┘  └──────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

Data Flow:
──────────

1. User Input → Frontend
2. Frontend → POST request → Express Server
3. Express → Spawns Python Process with parameters
4. Python → Routes to DSPy or Manual prompts
5. Python → Calls OpenAI API
6. Python → Calculates quality metrics
7. Python → Logs to database (mlops_config)
8. Python → Returns JSON with results + metrics
9. Express → Forwards response to Frontend
10. Frontend → Displays results + quality scores

Monitoring Flow:
───────────────

1. User requests metrics → Frontend
2. Frontend → GET /api/metrics → Express
3. Express → Spawns mlops_monitoring.py
4. Python → Queries database (SQLite)
5. Python → Aggregates statistics
6. Python → Compares prompt versions
7. Python → Returns analytics JSON
8. Express → Forwards to Frontend
9. Frontend → Displays dashboard

Key Features:
─────────────

✓ DSPy Chain of Thought reasoning
✓ Real-time cost tracking ($$$)
✓ Quality metrics (SEO, readability, relevance)
✓ A/B testing (manual vs DSPy)
✓ Historical analysis
✓ Production-ready monitoring
```
