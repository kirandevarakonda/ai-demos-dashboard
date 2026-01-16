# 🐳 Docker Setup Guide

Run the AI Demos Dashboard on **any system** with Docker!

## Prerequisites

- **Docker** installed ([Get Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** installed (usually comes with Docker Desktop)

## 🚀 Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

This is the easiest way to run everything:

```bash
# Build and start the dashboard
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

Access the dashboard at: **http://localhost:5000**

To stop:
```bash
docker-compose down
```

### Option 2: Using Docker Directly

```bash
# Build the image
docker build -t ai-demos-dashboard .

# Run the container
docker run -d \
  --name ai-demos-dashboard \
  -p 5000:5000 \
  -p 3000:3000 \
  -p 3001:3001 \
  -p 3002:3002 \
  -p 5001:5001 \
  -p 5173:5173 \
  -p 8080:8080 \
  -p 8081:8081 \
  -p 8501:8501 \
  -p 8502:8502 \
  -p 8507:8507 \
  ai-demos-dashboard

# View logs
docker logs -f ai-demos-dashboard

# Stop the container
docker stop ai-demos-dashboard

# Remove the container
docker rm ai-demos-dashboard
```

## 📋 Port Mappings

The Docker setup exposes these ports:

| Port | Service |
|------|---------|
| 5000 | Dashboard (Flask) |
| 5173 | blockchain-explorer |
| 8080 | content-generator |
| 5001 | MediChainAI |
| 8081 | multiagentchatbot |
| 8501 | Streamlit apps (Summarizer_AI, Maskdata) |
| 8507 | formfillingagent-browser |
| 3000-3002 | Additional Node.js apps |

## 🔧 Docker Commands Reference

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# With docker-compose
docker-compose logs -f

# With docker
docker logs -f ai-demos-dashboard
```

### Restart the Dashboard
```bash
# With docker-compose
docker-compose restart

# With docker
docker restart ai-demos-dashboard
```

### Rebuild After Changes
```bash
# With docker-compose
docker-compose up --build

# With docker
docker build -t ai-demos-dashboard . --no-cache
```

### Access Container Shell
```bash
# With docker-compose
docker-compose exec ai-demos-dashboard /bin/bash

# With docker
docker exec -it ai-demos-dashboard /bin/bash
```

### Clean Up Everything
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## 🛠️ Development with Docker

If you want to develop and see changes in real-time:

1. **Edit files locally** - Changes will be reflected in the container
2. **Restart if needed**:
   ```bash
   docker-compose restart
   ```

The `docker-compose.yml` is configured with volumes to mount your local files, so you can edit code and see changes.

## 📦 What's Inside the Container?

The Docker image includes:
- Python 3 with virtual environment
- Node.js 22
- All dashboard dependencies
- All project dependencies (Node.js and Python)
- Playwright browsers (for automation projects)
- System tools (curl, git, build-essential)

## 🌐 Accessing from Other Devices

If you want to access the dashboard from other devices on your network:

1. Find your machine's IP address:
   ```bash
   # On macOS/Linux
   ifconfig
   
   # On Windows
   ipconfig
   ```

2. Access from other devices using:
   ```
   http://<your-ip>:5000
   ```

## 🔍 Troubleshooting

### Container Exits Immediately
Check logs:
```bash
docker-compose logs
```

### Port Already in Use
Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "5001:5000"  # Use 5001 instead of 5000
```

### Build Fails
Try building with no cache:
```bash
docker-compose build --no-cache
```

### Out of Disk Space
Clean up Docker:
```bash
docker system prune -a
docker volume prune
```

## 🚀 Production Deployment

For production, consider:

1. **Disable debug mode** in `app.py`
2. **Use a production WSGI server** like gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
3. **Set up proper SSL/TLS** with nginx or a reverse proxy
4. **Use environment variables** for configuration
5. **Set up logging** and monitoring

## 📝 Notes

- The first build may take 5-10 minutes as it installs all dependencies
- Subsequent builds are faster thanks to Docker layer caching
- The container runs as a single service managing multiple projects
- Each project runs as a subprocess within the container

## ✨ Benefits of Docker Setup

✅ **Consistent Environment** - Works the same on any system  
✅ **Easy Setup** - One command to start everything  
✅ **Isolated** - Doesn't interfere with your local system  
✅ **Portable** - Share with team members easily  
✅ **Reproducible** - Same setup every time  

---

**Need help?** Check the main [README.md](README.md) for more information!
