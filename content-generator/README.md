# Quick Scribe AI Flow - Enhanced with DSPy + MLOps

A **production-grade** AI-powered content generation platform featuring:
- ✨ **DSPy Prompt Optimization** - Automatic prompt engineering for better quality
- 📊 **MLOps Monitoring** - Real-time metrics, cost tracking, and quality analytics
- 🔬 **A/B Testing** - Compare manual vs optimized prompts
- 💰 **Cost Tracking** - Monitor OpenAI API spending
- 📈 **Quality Metrics** - SEO, readability, and relevance scores

> **New in v2.0**: This isn't just a content generator - it's a fully monitored, optimized AI platform showcasing modern ML engineering practices!

## 🌟 What's New

### DSPy Integration
- Chain of Thought reasoning for better outputs
- Automatic prompt structure optimization
- Consistent, high-quality results

### MLOps Features
- Real-time performance monitoring dashboard
- Cost per endpoint tracking
- Quality score analytics (SEO, readability, relevance)
- Prompt version comparison (A/B testing)
- Historical metrics and trends
- SQLite database for comprehensive logging

---

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete installation and configuration
- **[DSPy + MLOps Documentation](README_DSPY_MLOPS.md)** - Detailed feature overview
- **[Original README](#original-features)** - Basic features and tech stack

---

# Original Features

A modern web application that helps content creators generate SEO-optimized content through an AI-powered workflow. The application uses React for the frontend and a Node.js/Python backend for AI processing.

## Project Structure

```
quick-scribe-ai-flow/
├── src/                    # Frontend React application
│   ├── components/        # React components
│   ├── pages/            # Page components
│   └── ...
├── backend/               # Backend server
│   ├── server.js         # Express server
│   ├── llm_service.py    # Python LLM service
│   └── requirements.txt   # Python dependencies
├── public/               # Static assets
└── ...
```

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- React Router DOM
- React Query
- React Hook Form
- Zod for validation

### Backend
- Node.js with Express
- Python for LLM processing
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v18 or higher)
- Python 3.x
- npm or yarn

## Environment Setup

1. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
```

2. Create a `.env` file in the backend directory:
```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
pip install -r requirements.txt
```

## Running the Application

1. Start the backend server:
```bash
cd backend
node server.js
```

2. Start the frontend development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### Keyword Generation
- `POST /api/keywords`
  - Body: `{ "seedKeyword": "your keyword" }`
  - Generates related keywords based on the seed keyword

### Title Generation
- `POST /api/titles`
  - Body: `{ "keyword": "your keyword" }`
  - Generates SEO-optimized titles

### Topic Generation
- `POST /api/topics`
  - Body: `{ "title": "your title" }`
  - Generates content topics based on the title

### Content Generation
- `POST /api/content`
  - Body: `{ "topic": "your topic" }`
  - Generates content based on the topic

## Development Workflow

1. The application follows a step-by-step content generation process:
   - Start with a seed keyword
   - Generate related keywords
   - Create SEO-optimized titles
   - Develop content topics
   - Generate final content

2. Each step is powered by AI processing through the Python backend service

3. The frontend provides a modern, responsive interface with:
   - Real-time updates
   - Progress tracking
   - Error handling
   - Loading states

## Building for Production

1. Build the frontend:
```bash
npm run build
```

2. The production build will be available in the `dist` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
