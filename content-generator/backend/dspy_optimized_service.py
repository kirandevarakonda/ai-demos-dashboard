"""
DSPy-Optimized LLM Service
Uses DSPy for automatic prompt optimization and better quality
"""

import os
import dspy
from typing import List
from dotenv import load_dotenv
import time

load_dotenv()

# Configure DSPy with OpenAI (v3.x API)
api_key = os.getenv('OPENAI_API_KEY')
lm = dspy.LM('openai/gpt-3.5-turbo', api_key=api_key, max_tokens=300)
dspy.configure(lm=lm)

# DSPy Signatures - Define what we want the LLM to do
class KeywordGeneration(dspy.Signature):
    """Generate related SEO keywords from a seed keyword."""
    seed_keyword = dspy.InputField(desc="The main keyword to generate related keywords from")
    keywords = dspy.OutputField(desc="A list of 5 related SEO keywords, one per line")

class TitleGeneration(dspy.Signature):
    """Generate SEO-optimized article titles."""
    keyword = dspy.InputField(desc="The target keyword for SEO optimization")
    titles = dspy.OutputField(desc="3 professional, engaging, SEO-optimized titles, one per line")

class TopicGeneration(dspy.Signature):
    """Generate detailed content topic ideas."""
    title = dspy.InputField(desc="The article title to generate topics for")
    topics = dspy.OutputField(desc="2 detailed, specific, actionable topic ideas, one per line")

class ContentGeneration(dspy.Signature):
    """Generate SEO-optimized content."""
    topic = dspy.InputField(desc="The topic to write content about")
    content = dspy.OutputField(desc="Professional, engaging, SEO-optimized content (100-200 words)")

# DSPy Modules - Composable prompt programs
class KeywordGenerator(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.ChainOfThought(KeywordGeneration)
    
    def forward(self, seed_keyword: str):
        result = self.generate(seed_keyword=seed_keyword)
        return result.keywords

class TitleGenerator(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.ChainOfThought(TitleGeneration)
    
    def forward(self, keyword: str):
        result = self.generate(keyword=keyword)
        return result.titles

class TopicGenerator(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.ChainOfThought(TopicGeneration)
    
    def forward(self, title: str):
        result = self.generate(title=title)
        return result.topics

class ContentGenerator(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.ChainOfThought(ContentGeneration)
    
    def forward(self, topic: str):
        result = self.generate(topic=topic)
        return result.content

# Initialize generators
keyword_gen = KeywordGenerator()
title_gen = TitleGenerator()
topic_gen = TopicGenerator()
content_gen = ContentGenerator()

def generate_keywords_dspy(seed_keyword: str) -> tuple[List[str], float]:
    """Generate keywords using DSPy with timing"""
    start_time = time.time()
    result = keyword_gen(seed_keyword=seed_keyword)
    latency_ms = (time.time() - start_time) * 1000
    
    # Parse result into list
    keywords = [k.strip() for k in result.split('\n') if k.strip()]
    return keywords, latency_ms

def generate_titles_dspy(keyword: str) -> tuple[List[str], float]:
    """Generate titles using DSPy with timing"""
    start_time = time.time()
    result = title_gen(keyword=keyword)
    latency_ms = (time.time() - start_time) * 1000
    
    titles = [t.strip() for t in result.split('\n') if t.strip()]
    return titles, latency_ms

def generate_topics_dspy(title: str) -> tuple[List[str], float]:
    """Generate topics using DSPy with timing"""
    start_time = time.time()
    result = topic_gen(title=title)
    latency_ms = (time.time() - start_time) * 1000
    
    topics = [t.strip() for t in result.split('\n') if t.strip()]
    return topics, latency_ms

def generate_content_dspy(topic: str) -> tuple[str, float]:
    """Generate content using DSPy with timing"""
    start_time = time.time()
    result = content_gen(topic=topic)
    latency_ms = (time.time() - start_time) * 1000
    
    return result, latency_ms

# Quality evaluation metrics
def calculate_seo_score(content: str, keyword: str) -> float:
    """Calculate SEO score based on keyword presence and density"""
    content_lower = content.lower()
    keyword_lower = keyword.lower()
    
    # Keyword presence
    keyword_count = content_lower.count(keyword_lower)
    keyword_score = min(keyword_count * 0.2, 0.5)
    
    # Content length
    word_count = len(content.split())
    if 100 <= word_count <= 200:
        length_score = 0.5
    elif 80 <= word_count < 100 or 200 < word_count <= 250:
        length_score = 0.3
    else:
        length_score = 0.1
    
    return round(keyword_score + length_score, 2)

def calculate_readability_score(content: str) -> float:
    """Calculate readability score (simplified Flesch reading ease)"""
    words = content.split()
    sentences = content.count('.') + content.count('!') + content.count('?')
    
    if sentences == 0 or len(words) == 0:
        return 0.5
    
    avg_words_per_sentence = len(words) / sentences
    
    # Ideal: 15-20 words per sentence
    if 15 <= avg_words_per_sentence <= 20:
        return 1.0
    elif 10 <= avg_words_per_sentence < 15 or 20 < avg_words_per_sentence <= 25:
        return 0.7
    else:
        return 0.4

def calculate_relevance_score(output: str, input_text: str) -> float:
    """Calculate relevance score based on input-output alignment"""
    output_words = set(output.lower().split())
    input_words = set(input_text.lower().split())
    
    if len(input_words) == 0:
        return 0.5
    
    # Calculate overlap
    overlap = len(output_words & input_words) / len(input_words)
    return min(overlap, 1.0)
