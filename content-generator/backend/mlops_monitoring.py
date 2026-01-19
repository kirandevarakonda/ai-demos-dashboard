"""
MLOps Monitoring Script
Provides analytics and insights from logged metrics
"""

import sys
import json
from datetime import datetime, timedelta
from sqlalchemy import func
from mlops_config import get_db_session, LLMMetric, QualityMetric

def get_overall_metrics():
    """Get overall system metrics"""
    session = get_db_session()
    
    try:
        # Overall stats
        total_calls = session.query(func.count(LLMMetric.id)).scalar() or 0
        total_cost = session.query(func.sum(LLMMetric.cost_usd)).scalar() or 0
        avg_latency = session.query(func.avg(LLMMetric.latency_ms)).scalar() or 0
        
        success_count = session.query(func.count(LLMMetric.id)).filter(
            LLMMetric.success == True
        ).scalar() or 0
        success_rate = (success_count / total_calls * 100) if total_calls > 0 else 0
        
        # Per endpoint stats
        endpoint_stats = session.query(
            LLMMetric.endpoint,
            func.count(LLMMetric.id).label('count'),
            func.avg(LLMMetric.latency_ms).label('avg_latency'),
            func.sum(LLMMetric.cost_usd).label('total_cost'),
            func.avg(LLMMetric.tokens_used).label('avg_tokens')
        ).group_by(LLMMetric.endpoint).all()
        
        # Recent quality scores
        recent_quality = session.query(
            func.avg(QualityMetric.seo_score).label('avg_seo'),
            func.avg(QualityMetric.readability_score).label('avg_readability'),
            func.avg(QualityMetric.relevance_score).label('avg_relevance'),
            func.avg(QualityMetric.overall_score).label('avg_overall')
        ).first()
        
        return {
            'overall': {
                'total_calls': total_calls,
                'total_cost_usd': round(total_cost, 4),
                'avg_latency_ms': round(avg_latency, 2),
                'success_rate_pct': round(success_rate, 2)
            },
            'by_endpoint': [
                {
                    'endpoint': stat.endpoint,
                    'call_count': stat.count,
                    'avg_latency_ms': round(stat.avg_latency or 0, 2),
                    'total_cost_usd': round(stat.total_cost or 0, 4),
                    'avg_tokens': round(stat.avg_tokens or 0, 0)
                }
                for stat in endpoint_stats
            ],
            'quality_scores': {
                'avg_seo_score': round(recent_quality.avg_seo or 0, 2),
                'avg_readability_score': round(recent_quality.avg_readability or 0, 2),
                'avg_relevance_score': round(recent_quality.avg_relevance or 0, 2),
                'avg_overall_score': round(recent_quality.avg_overall or 0, 2)
            }
        }
    finally:
        session.close()

def compare_prompt_versions():
    """Compare manual vs DSPy-optimized prompts"""
    session = get_db_session()
    
    try:
        # Stats by prompt version
        version_stats = session.query(
            LLMMetric.prompt_version,
            LLMMetric.endpoint,
            func.count(LLMMetric.id).label('count'),
            func.avg(LLMMetric.latency_ms).label('avg_latency'),
            func.avg(LLMMetric.cost_usd).label('avg_cost')
        ).group_by(
            LLMMetric.prompt_version,
            LLMMetric.endpoint
        ).all()
        
        # Quality by prompt version
        quality_stats = session.query(
            LLMMetric.prompt_version,
            QualityMetric.endpoint,
            func.avg(QualityMetric.seo_score).label('avg_seo'),
            func.avg(QualityMetric.readability_score).label('avg_readability'),
            func.avg(QualityMetric.relevance_score).label('avg_relevance'),
            func.avg(QualityMetric.overall_score).label('avg_overall')
        ).join(
            LLMMetric,
            LLMMetric.id == QualityMetric.llm_metric_id
        ).group_by(
            LLMMetric.prompt_version,
            QualityMetric.endpoint
        ).all()
        
        # Organize results
        comparison = {}
        
        for stat in version_stats:
            key = f"{stat.endpoint}_{stat.prompt_version}"
            comparison[key] = {
                'endpoint': stat.endpoint,
                'prompt_version': stat.prompt_version,
                'call_count': stat.count,
                'avg_latency_ms': round(stat.avg_latency or 0, 2),
                'avg_cost_usd': round(stat.avg_cost or 0, 6)
            }
        
        for stat in quality_stats:
            key = f"{stat.endpoint}_{stat.prompt_version}"
            if key in comparison:
                comparison[key]['quality'] = {
                    'avg_seo_score': round(stat.avg_seo or 0, 2),
                    'avg_readability_score': round(stat.avg_readability or 0, 2),
                    'avg_relevance_score': round(stat.avg_relevance or 0, 2),
                    'avg_overall_score': round(stat.avg_overall or 0, 2)
                }
        
        return {
            'comparison': list(comparison.values()),
            'summary': calculate_comparison_summary(comparison)
        }
    finally:
        session.close()

def calculate_comparison_summary(comparison):
    """Calculate which version performs better"""
    summary = {
        'dspy_advantages': [],
        'manual_advantages': [],
        'recommendation': ''
    }
    
    # Group by endpoint
    endpoints = {}
    for key, data in comparison.items():
        endpoint = data['endpoint']
        if endpoint not in endpoints:
            endpoints[endpoint] = {}
        endpoints[endpoint][data['prompt_version']] = data
    
    # Compare each endpoint
    for endpoint, versions in endpoints.items():
        if 'dspy-optimized' in versions and 'manual' in versions:
            dspy = versions['dspy-optimized']
            manual = versions['manual']
            
            # Compare quality
            dspy_quality = dspy.get('quality', {}).get('avg_overall_score', 0)
            manual_quality = manual.get('quality', {}).get('avg_overall_score', 0)
            
            # Compare speed
            dspy_latency = dspy.get('avg_latency_ms', 0)
            manual_latency = manual.get('avg_latency_ms', 0)
            
            if dspy_quality > manual_quality:
                summary['dspy_advantages'].append(
                    f"{endpoint}: +{round((dspy_quality - manual_quality) * 100, 1)}% quality"
                )
            elif manual_quality > dspy_quality:
                summary['manual_advantages'].append(
                    f"{endpoint}: +{round((manual_quality - dspy_quality) * 100, 1)}% quality"
                )
    
    # Overall recommendation
    if len(summary['dspy_advantages']) > len(summary['manual_advantages']):
        summary['recommendation'] = 'DSPy optimization recommended for better quality'
    elif len(summary['manual_advantages']) > len(summary['dspy_advantages']):
        summary['recommendation'] = 'Manual prompts performing better'
    else:
        summary['recommendation'] = 'Performance is similar, use DSPy for future optimization'
    
    return summary

def get_metrics_history(hours=24):
    """Get metrics history for the last N hours"""
    session = get_db_session()
    
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        metrics = session.query(LLMMetric).filter(
            LLMMetric.timestamp >= cutoff_time
        ).order_by(LLMMetric.timestamp.desc()).limit(100).all()
        
        history = []
        for metric in metrics:
            quality = session.query(QualityMetric).filter(
                QualityMetric.llm_metric_id == metric.id
            ).first()
            
            history.append({
                'timestamp': metric.timestamp.isoformat(),
                'endpoint': metric.endpoint,
                'prompt_version': metric.prompt_version,
                'latency_ms': round(metric.latency_ms, 2),
                'cost_usd': round(metric.cost_usd, 6),
                'success': metric.success,
                'quality_score': round(quality.overall_score, 2) if quality else None
            })
        
        return {
            'time_range_hours': hours,
            'total_records': len(history),
            'history': history
        }
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing command"}), file=sys.stderr)
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "get_metrics":
            result = get_overall_metrics()
            print(json.dumps(result))
        
        elif command == "compare_prompts":
            result = compare_prompt_versions()
            print(json.dumps(result))
        
        elif command == "get_history":
            hours = int(sys.argv[2]) if len(sys.argv) > 2 else 24
            result = get_metrics_history(hours)
            print(json.dumps(result))
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}), file=sys.stderr)
            sys.exit(1)
    
    except Exception as e:
        import traceback
        error_msg = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(json.dumps({"error": error_msg}), file=sys.stderr)
        sys.exit(1)
