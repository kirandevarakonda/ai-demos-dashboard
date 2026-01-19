"""
Enhanced LLM Service with DSPy Optimization and MLOps Monitoring
Combines manual prompts and DSPy-optimized prompts with comprehensive tracking
"""

import os
import sys
import json
import traceback
import time
from openai import OpenAI
from typing import List, Dict, Any
from dotenv import load_dotenv

# Import MLOps and DSPy modules
from mlops_config import log_llm_call, log_quality_metric
from dspy_optimized_service import (
    generate_keywords_dspy,
    generate_titles_dspy,
    generate_topics_dspy,
    generate_content_dspy,
    calculate_seo_score,
    calculate_readability_score,
    calculate_relevance_score
)

load_dotenv()

# Verify API key
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print(json.dumps({"error": "OPENAI_API_KEY not found"}), file=sys.stderr)
    sys.exit(1)

try:
    client = OpenAI(api_key=api_key)
except Exception as e:
    print(json.dumps({"error": f"Failed to initialize OpenAI: {str(e)}"}), file=sys.stderr)
    sys.exit(1)

# Manual prompt functions (original)
def generate_keywords_manual(seed_keyword: str) -> tuple[List[str], float]:
    """Generate keywords using manual prompts"""
    start_time = time.time()
    
    try:
        prompt = f"Suggest 5 related keywords for '{seed_keyword}'. Return only the keywords, one per line."
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful SEO assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        latency_ms = (time.time() - start_time) * 1000
        keywords = response.choices[0].message.content.strip().split('\n')
        keywords = [k.strip() for k in keywords if k.strip()]
        
        return keywords, latency_ms
    except Exception as e:
        raise Exception(f"Error generating keywords: {str(e)}")

def generate_titles_manual(keyword: str) -> tuple[List[str], float]:
    """Generate titles using manual prompts"""
    start_time = time.time()
    
    try:
        prompt = f"Generate 3 SEO-optimized titles for '{keyword}'. Make them professional and engaging. Return only the titles, one per line."
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional SEO content writer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        latency_ms = (time.time() - start_time) * 1000
        titles = response.choices[0].message.content.strip().split('\n')
        titles = [t.strip() for t in titles if t.strip()]
        
        return titles, latency_ms
    except Exception as e:
        raise Exception(f"Error generating titles: {str(e)}")

def generate_topics_manual(title: str) -> tuple[List[str], float]:
    """Generate topics using manual prompts"""
    start_time = time.time()
    
    try:
        prompt = f"Generate 2 detailed topic ideas for the title: '{title}'. Make them specific and actionable. Return only the topics, one per line."
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional content strategist."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        latency_ms = (time.time() - start_time) * 1000
        topics = response.choices[0].message.content.strip().split('\n')
        topics = [t.strip() for t in topics if t.strip()]
        
        return topics, latency_ms
    except Exception as e:
        raise Exception(f"Error generating topics: {str(e)}")

def generate_content_manual(topic: str) -> tuple[str, float]:
    """Generate content using manual prompts"""
    start_time = time.time()
    
    try:
        prompt = f"Write a short, SEO-optimized piece of content (100-200 words) about: '{topic}'. Make it professional and engaging."
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional content writer specializing in SEO."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        latency_ms = (time.time() - start_time) * 1000
        content = response.choices[0].message.content.strip()
        
        return content, latency_ms
    except Exception as e:
        raise Exception(f"Error generating content: {str(e)}")

# Unified generation functions with monitoring
def generate_with_monitoring(
    endpoint: str,
    input_text: str,
    use_dspy: bool = True
) -> Dict[str, Any]:
    """
    Generate content with full MLOps monitoring
    
    Args:
        endpoint: One of 'keywords', 'titles', 'topics', 'content'
        input_text: Input text for generation
        use_dspy: Whether to use DSPy-optimized prompts (default: True)
    
    Returns:
        Dict with result, metrics, and quality scores
    """
    prompt_version = "dspy-optimized" if use_dspy else "manual"
    success = True
    error_message = None
    result = None
    latency_ms = 0
    
    try:
        # Route to appropriate generator
        if endpoint == "keywords":
            if use_dspy:
                result, latency_ms = generate_keywords_dspy(input_text)
            else:
                result, latency_ms = generate_keywords_manual(input_text)
        
        elif endpoint == "titles":
            if use_dspy:
                result, latency_ms = generate_titles_dspy(input_text)
            else:
                result, latency_ms = generate_titles_manual(input_text)
        
        elif endpoint == "topics":
            if use_dspy:
                result, latency_ms = generate_topics_dspy(input_text)
            else:
                result, latency_ms = generate_topics_manual(input_text)
        
        elif endpoint == "content":
            if use_dspy:
                result, latency_ms = generate_content_dspy(input_text)
            else:
                result, latency_ms = generate_content_manual(input_text)
        
        else:
            raise ValueError(f"Unknown endpoint: {endpoint}")
        
        # Convert result to string for logging
        output_text = '\n'.join(result) if isinstance(result, list) else result
        
    except Exception as e:
        success = False
        error_message = str(e)
        output_text = ""
        result = None
    
    # Log to database
    tokens_used = (len(input_text) + len(output_text)) // 4  # Rough estimate
    metric_id = log_llm_call(
        endpoint=endpoint,
        prompt_version=prompt_version,
        model="gpt-3.5-turbo",
        input_text=input_text,
        output_text=output_text,
        tokens_used=tokens_used,
        latency_ms=latency_ms,
        success=success,
        error_message=error_message
    )
    
    # Calculate quality metrics if successful
    quality_scores = {}
    if success and result:
        seo_score = calculate_seo_score(output_text, input_text)
        readability_score = calculate_readability_score(output_text)
        relevance_score = calculate_relevance_score(output_text, input_text)
        
        quality_scores = {
            "seo_score": seo_score,
            "readability_score": readability_score,
            "relevance_score": relevance_score,
            "overall_score": round((seo_score + readability_score + relevance_score) / 3, 2)
        }
        
        # Log quality metrics
        if metric_id:
            log_quality_metric(
                llm_metric_id=metric_id,
                endpoint=endpoint,
                seo_score=seo_score,
                readability_score=readability_score,
                relevance_score=relevance_score
            )
    
    return {
        "success": success,
        "result": result,
        "error": error_message,
        "metrics": {
            "latency_ms": round(latency_ms, 2),
            "tokens_used": tokens_used,
            "prompt_version": prompt_version
        },
        "quality": quality_scores
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: python llm_service_enhanced.py <command> <input> [use_dspy]"}), file=sys.stderr)
        sys.exit(1)
    
    command = sys.argv[1]
    input_text = sys.argv[2]
    use_dspy = sys.argv[3].lower() == 'true' if len(sys.argv) > 3 else True
    
    try:
        # Map command to endpoint
        endpoint_map = {
            "generate_keywords": "keywords",
            "generate_titles": "titles",
            "generate_topics": "topics",
            "generate_content": "content"
        }
        
        if command not in endpoint_map:
            print(json.dumps({"error": f"Unknown command: {command}"}), file=sys.stderr)
            sys.exit(1)
        
        endpoint = endpoint_map[command]
        response = generate_with_monitoring(endpoint, input_text, use_dspy)
        
        if response["success"]:
            # Format output for backward compatibility
            result_key = command.replace("generate_", "")
            print(json.dumps({
                result_key: response["result"],
                "metrics": response["metrics"],
                "quality": response["quality"]
            }))
        else:
            print(json.dumps({"error": response["error"]}), file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        error_msg = f"Error in {command}: {str(e)}\n{traceback.format_exc()}"
        print(json.dumps({"error": error_msg}), file=sys.stderr)
        sys.exit(1)
