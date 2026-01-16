# 🔑 Environment Variables Setup Guide

This guide explains all the API keys and environment variables required for the AI Demos Dashboard projects.

## 📋 Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your API keys**

3. **Required for Docker:**
   - Docker automatically loads the `.env` file
   - Just run: `docker-compose up -d --build`

4. **Required for Local Setup:**
   - The `.env` file will be loaded by individual projects
   - Make sure to activate venv before running

---

## 🔑 Required API Keys by Project

### 1. **content-generator**
**Required:**
- `OPENAI_API_KEY` - For AI content generation
- `VITE_FIREBASE_API_KEY` - Firebase authentication
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging
- `VITE_FIREBASE_APP_ID` - Firebase app ID

**How to get:**
- OpenAI: https://platform.openai.com/api-keys
- Firebase: https://console.firebase.google.com/
  1. Create a project
  2. Go to Project Settings > General
  3. Scroll to "Your apps" > Web app
  4. Copy the config values

### 2. **blockchain-explorer**
**Required:**
- `GEMINI_API_KEY` - Google Gemini API for blockchain analysis

**How to get:**
- Google AI Studio: https://makersuite.google.com/app/apikey

### 3. **Summarizer_AI**
**Required:**
- `OPENAI_API_KEY` - For text summarization

### 4. **formfillingagent-browser**
**Required:**
- `OPENAI_API_KEY` - For AI-powered form filling

### 5. **MediChainAI**
**Optional:**
- `SESSION_SECRET` - For session security (generate with `openssl rand -hex 32`)
- `OPENAI_API_KEY` - If using AI features

### 6. **Maskdata** & **multiagentchatbot**
These may work without API keys or check their specific documentation.

---

## 🔐 How to Get API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and paste into your `.env` file

**Cost:** Pay-as-you-go (requires billing setup)

### Google Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create an API key
4. Copy and paste into your `.env` file

**Cost:** Free tier available

### Firebase Configuration
1. Go to https://console.firebase.google.com/
2. Create a new project or select existing
3. Click on "Web" icon (</>) to add a web app
4. Register your app
5. Copy all the config values to your `.env` file

**Cost:** Free tier available (Spark plan)

---

## 📝 .env File Example

```bash
# OpenAI (required by 4 projects)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxx

# Google Gemini (required by blockchain-explorer)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx

# Firebase (required by content-generator)
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Application Settings
NODE_ENV=development
SESSION_SECRET=your_random_secret_here
```

---

## 🐳 Docker-Specific Notes

When using Docker:
- The `.env` file is automatically loaded by `docker-compose.yml`
- All environment variables are passed into the container
- No need to set them inside the container

**Rebuild after changing .env:**
```bash
docker-compose down
docker-compose up -d --build
```

---

## 💻 Local Setup Notes  

When running locally:
- **Node.js projects** will read from `.env` files in their directories
- **Python projects** use `python-dotenv` to load `.env` from project root
- Create `.env` in the main dashboard directory

**Some projects may need their own .env files:**
- `blockchain-explorer/.env` - for GEMINI_API_KEY
- `content-generator/.env` - for Firebase and OPENAI keys

You can either:
1. Create individual `.env` files in each project, OR
2. Use the main `.env` file (recommended with Docker)

---

## ⚠️ Security Best Practices

1. **Never commit the .env file** - It's in `.gitignore` by default
2. **Rotate keys regularly** - Especially if they might be compromised
3. **Use different keys** for development and production
4. **Limit API key permissions** where possible
5. **Monitor API usage** to detect unauthorized access
6. **Set spending limits** on paid APIs (OpenAI, etc.)

---

## 🔍 Troubleshooting

### "API key not found" errors

**For Docker:**
```bash
# Check if .env file exists
ls -la .env

# Check if variables are loaded
docker-compose config

# Restart containers
docker-compose restart
```

**For Local:**
```bash
# Check if .env exists
cat .env

# Make sure you're in the right directory
pwd

# Check if project loads environment variables
# (look for 'dotenv' or similar in package.json/requirements.txt)
```

### Projects still not working

1. **Check the specific project's documentation** - Some might need keys in specific locations
2. **Check console/logs** for specific error messages
3. **Verify API key validity** - Test keys directly in their respective platforms
4. **Check rate limits** - Some APIs have rate limits on free tiers

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Environment Variables Best Practices](https://12factor.net/config)

---

## ✅ Checklist

Before starting projects, make sure you have:

- [ ] Created `.env` file from `.env.example`
- [ ] Added OPENAI_API_KEY (for content-generator, Summarizer_AI, formfillingagent-browser)
- [ ] Added GEMINI_API_KEY (for blockchain-explorer)
- [ ] Added Firebase config (for content-generator - 6 variables)
- [ ] Generated SESSION_SECRET (for MediChainAI)
- [ ] Verified `.env` is in `.gitignore`
- [ ] Never committed API keys to git

**Ready to go!** Your projects should now work with full functionality. 🚀
