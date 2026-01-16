# Multi-stage build for AI Demos Dashboard
FROM node:22-slim AS node-base

# Install Python and system dependencies
FROM node-base AS builder
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files for all Node.js projects
COPY blockchain-explorer/package*.json ./blockchain-explorer/ 2>/dev/null || true
COPY MediChainAI/package*.json ./MediChainAI/ 2>/dev/null || true
COPY multiagentchatbot/package*.json ./multiagentchatbot/ 2>/dev/null || true
COPY content-generator/package*.json ./content-generator/ 2>/dev/null || true
COPY content-generator/backend/package*.json ./content-generator/backend/ 2>/dev/null || true

# Install Node.js dependencies for each project
RUN cd blockchain-explorer && npm install --production 2>/dev/null || true
RUN cd MediChainAI && npm install --production 2>/dev/null || true
RUN cd multiagentchatbot && npm install --production 2>/dev/null || true
RUN cd content-generator && npm install --production 2>/dev/null || true
RUN cd content-generator/backend && npm install --production 2>/dev/null || true

# Final stage
FROM node-base

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy application files
COPY . .

# Copy installed node_modules from builder
COPY --from=builder /app/blockchain-explorer/node_modules ./blockchain-explorer/node_modules/ 2>/dev/null || true
COPY --from=builder /app/MediChainAI/node_modules ./MediChainAI/node_modules/ 2>/dev/null || true
COPY --from=builder /app/multiagentchatbot/node_modules ./multiagentchatbot/node_modules/ 2>/dev/null || true
COPY --from=builder /app/content-generator/node_modules ./content-generator/node_modules/ 2>/dev/null || true
COPY --from=builder /app/content-generator/backend/node_modules ./content-generator/backend/node_modules/ 2>/dev/null || true

# Create Python virtual environment
RUN python3 -m venv /app/venv

# Activate venv and install Python dependencies for dashboard
RUN /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Install Python dependencies for Python projects
RUN /app/venv/bin/pip install --no-cache-dir -r Maskdata/requirements.txt 2>/dev/null || true
RUN /app/venv/bin/pip install --no-cache-dir -r Summarizer_AI/requirements.txt 2>/dev/null || true
RUN /app/venv/bin/pip install --no-cache-dir -r formfillingagent-browser/requirements.txt 2>/dev/null || true
RUN /app/venv/bin/pip install --no-cache-dir -r content-generator/backend/requirements.txt 2>/dev/null || true

# Install Playwright browsers
RUN /app/venv/bin/playwright install chromium && \
    /app/venv/bin/playwright install-deps chromium

# Expose the dashboard port
EXPOSE 5000

# Expose common ports used by projects
EXPOSE 3000 3001 3002 5001 5173 8080 8081 8501 8502 8507

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/venv/bin:$PATH"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Run the dashboard
CMD ["python", "app.py"]
