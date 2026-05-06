# DocForge — Setup & Run Guide

## Prerequisites

Install these on your system before starting:

| Tool | Version | Install Guide |
|------|---------|--------------|
| **Node.js** | 20+ | https://nodejs.org/en/download |
| **MongoDB** | 7+ | https://www.mongodb.com/docs/manual/installation/ |
| **Redis** | 7+ | https://redis.io/docs/getting-started/installation/ |
| **Git** | any | https://git-scm.com/downloads |

---

## Step-by-Step Setup

### 1. Clone / Copy the project

```bash
# If you have the project folder, copy it to your desired location
cp -r docforge ~/projects/docforge
cd ~/projects/docforge
```

### 2. Install all dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Setup environment variables

```bash
# Copy the example env file to the server directory
cp .env.example server/.env
```

Now **edit `server/.env`** with your actual values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB — use your connection string
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/docforge
# OR MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/docforge

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets — generate random strings (use any long random string)
JWT_ACCESS_SECRET=myAccessSecret123!@#ChangeThis
JWT_REFRESH_SECRET=myRefreshSecret456!@#ChangeThis
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AI Provider: "gemini" or "openai"
AI_PROVIDER=gemini

# Get your Gemini API key from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here

# OR if using OpenAI: https://platform.openai.com/api-keys
# AI_PROVIDER=openai
# OPENAI_API_KEY=your_actual_openai_api_key_here

# Client URL (don't change for local dev)
CLIENT_URL=http://localhost:5173
```

### 4. Start MongoDB

```bash
# Linux (Ubuntu/Debian)
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community

# Windows
# MongoDB should be running as a service after installation
# Or run: mongod --dbpath="C:\data\db"

# Verify MongoDB is running:
mongosh --eval "db.runCommand({ping:1})"
# Should print: { ok: 1 }
```

### 5. Start Redis

```bash
# Linux (Ubuntu/Debian)
sudo systemctl start redis-server

# macOS (Homebrew)
brew services start redis

# Windows
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use WSL

# Verify Redis is running:
redis-cli ping
# Should print: PONG
```

### 6. Run the application

```bash
# From the project root (docforge/)
npm run dev
```

This starts **both** the client and server concurrently:
- 🌐 **Frontend**: http://localhost:5173
- 🖥️ **Backend**: http://localhost:5000
- ❤️ **Health Check**: http://localhost:5000/api/health

**OR** run them separately in two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

---

## First Time Usage

1. Open **http://localhost:5173** in your browser
2. Click **"Sign up free"**
3. Create an account (name, email, password)
4. You'll be redirected to the **Dashboard**
5. Click **"New Document"**
6. **Upload** any `.docx` file (max 10MB)
7. **Select a template** (Blog Post, Journal Paper, CV, Bio Data, or Report)
8. **Choose tone** (Formal, Casual, Polite, Aggressive, Academic)
9. **Select output format** (DOCX or PDF)
10. Click **"Process Document"**
11. Watch the **real-time progress bar**
12. **Download** your formatted document
13. View the **change summary** showing what AI enhanced

---

## Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running: `sudo systemctl start mongod`
- Check your `MONGODB_URI` in `server/.env`

### "Redis connection error"
- Make sure Redis is running: `sudo systemctl start redis-server`
- Check `REDIS_HOST` and `REDIS_PORT` in `server/.env`

### "AI processing failed"
- Verify your `GEMINI_API_KEY` (or `OPENAI_API_KEY`) is valid
- Check that `AI_PROVIDER` matches the key you provided
- Get a free Gemini key at: https://aistudio.google.com/apikey

### "Port already in use"
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### "Module not found" errors
```bash
# Reinstall all dependencies
rm -rf node_modules server/node_modules client/node_modules
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

---

## Project Structure Quick Reference

```
docforge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # 7 pages (Landing, Login, Signup, Dashboard, Upload, Processing, Result)
│   │   ├── components/     # Navbar + 13 shadcn/ui components
│   │   ├── stores/         # Zustand state (auth, upload)
│   │   ├── lib/            # API client, Socket.io client
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB, Redis, AI, env configs
│   │   ├── models/         # User, Document (Mongoose)
│   │   ├── controllers/    # Auth, Document logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # JWT auth, file upload, rate limit
│   │   ├── services/       # AI calls, DOCX parsing/building
│   │   ├── templates/      # 5 template definitions
│   │   ├── workers/        # BullMQ processing pipeline
│   │   ├── socket/         # Socket.io real-time events
│   │   └── app.ts          # Entry point
│   ├── uploads/            # Uploaded files (auto-created)
│   ├── outputs/            # Generated files (auto-created)
│   └── package.json
│
├── .env.example            # Environment template
└── package.json            # Monorepo root
```
