"""
MLOps Configuration and Database Setup
Handles metrics tracking, logging, and monitoring configuration
"""

import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

Base = declarative_base()

class LLMMetric(Base):
    """Store metrics for each LLM API call"""
    __tablename__ = 'llm_metrics'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    endpoint = Column(String(50))  # keywords, titles, topics, content
    prompt_version = Column(String(20))  # manual or dspy-optimized
    model = Column(String(50))
    input_text = Column(Text)
    output_text = Column(Text)
    tokens_used = Column(Integer)
    latency_ms = Column(Float)
    cost_usd = Column(Float)
    success = Column(Boolean)
    error_message = Column(Text, nullable=True)
    meta_data = Column(Text)  # JSON string for additional data (renamed from metadata)

class PromptVersion(Base):
    """Track different prompt versions for A/B testing"""
    __tablename__ = 'prompt_versions'
    
    id = Column(Integer, primary_key=True)
    endpoint = Column(String(50))
    version_name = Column(String(20))
    prompt_template = Column(Text)
    system_message = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    avg_quality_score = Column(Float, default=0.0)
    total_calls = Column(Integer, default=0)

class QualityMetric(Base):
    """Store quality metrics for generated content"""
    __tablename__ = 'quality_metrics'
    
    id = Column(Integer, primary_key=True)
    llm_metric_id = Column(Integer)
    endpoint = Column(String(50))
    seo_score = Column(Float)
    readability_score = Column(Float)
    relevance_score = Column(Float)
    overall_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'mlops_data.db')
engine = create_engine(f'sqlite:///{DB_PATH}')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

# Pricing configuration (OpenAI GPT-3.5-turbo)
TOKEN_PRICING = {
    'gpt-3.5-turbo': {
        'input': 0.0015 / 1000,  # $0.0015 per 1K tokens
        'output': 0.002 / 1000,   # $0.002 per 1K tokens
    },
    'gpt-4': {
        'input': 0.03 / 1000,
        'output': 0.06 / 1000,
    }
}

def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate API call cost"""
    if model not in TOKEN_PRICING:
        model = 'gpt-3.5-turbo'
    
    pricing = TOKEN_PRICING[model]
    input_cost = input_tokens * pricing['input']
    output_cost = output_tokens * pricing['output']
    return round(input_cost + output_cost, 6)

def get_db_session():
    """Get database session"""
    return SessionLocal()

def log_llm_call(
    endpoint: str,
    prompt_version: str,
    model: str,
    input_text: str,
    output_text: str,
    tokens_used: int,
    latency_ms: float,
    success: bool,
    error_message: str = None,
    metadata: dict = None
):
    """Log LLM API call to database"""
    session = get_db_session()
    
    try:
        # Estimate token counts (rough approximation: 1 token ≈ 4 characters)
        input_tokens = len(input_text) // 4
        output_tokens = len(output_text) // 4 if output_text else 0
        cost = calculate_cost(model, input_tokens, output_tokens)
        
        metric = LLMMetric(
            endpoint=endpoint,
            prompt_version=prompt_version,
            model=model,
            input_text=input_text[:1000],  # Limit storage
            output_text=output_text[:2000] if output_text else None,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            cost_usd=cost,
            success=success,
            error_message=error_message,
            meta_data=json.dumps(metadata) if metadata else None
        )
        
        session.add(metric)
        session.commit()
        return metric.id
    except Exception as e:
        session.rollback()
        print(f"Error logging metric: {e}")
        return None
    finally:
        session.close()

def log_quality_metric(
    llm_metric_id: int,
    endpoint: str,
    seo_score: float,
    readability_score: float,
    relevance_score: float
):
    """Log quality metrics"""
    session = get_db_session()
    
    try:
        overall_score = (seo_score + readability_score + relevance_score) / 3
        
        quality = QualityMetric(
            llm_metric_id=llm_metric_id,
            endpoint=endpoint,
            seo_score=seo_score,
            readability_score=readability_score,
            relevance_score=relevance_score,
            overall_score=overall_score
        )
        
        session.add(quality)
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error logging quality metric: {e}")
    finally:
        session.close()

def get_metrics_summary():
    """Get summary of all metrics"""
    session = get_db_session()
    
    try:
        from sqlalchemy import func
        
        # Overall stats
        total_calls = session.query(func.count(LLMMetric.id)).scalar()
        total_cost = session.query(func.sum(LLMMetric.cost_usd)).scalar() or 0
        avg_latency = session.query(func.avg(LLMMetric.latency_ms)).scalar() or 0
        success_rate = session.query(
            func.avg(LLMMetric.success.cast(Integer))
        ).scalar() or 0
        
        # Per endpoint stats
        endpoint_stats = session.query(
            LLMMetric.endpoint,
            func.count(LLMMetric.id).label('count'),
            func.avg(LLMMetric.latency_ms).label('avg_latency'),
            func.sum(LLMMetric.cost_usd).label('total_cost')
        ).group_by(LLMMetric.endpoint).all()
        
        return {
            'overall': {
                'total_calls': total_calls,
                'total_cost_usd': round(total_cost, 4),
                'avg_latency_ms': round(avg_latency, 2),
                'success_rate': round(success_rate * 100, 2)
            },
            'by_endpoint': [
                {
                    'endpoint': stat.endpoint,
                    'call_count': stat.count,
                    'avg_latency_ms': round(stat.avg_latency, 2),
                    'total_cost_usd': round(stat.total_cost, 4)
                }
                for stat in endpoint_stats
            ]
        }
    finally:
        session.close()
