import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import { startWorker } from './workers/processing.worker.js';
import { apiRateLimit } from './middleware/rateLimit.middleware.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import projectRoutes from './routes/project.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import chatRoutes from './routes/chat.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for SPA
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? [env.CLIENT_URL, /\.onrender\.com$/]
    : env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimit);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve client static files in production
if (env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  if (err.message === 'Only .docx files are allowed') {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'File size exceeds 10MB limit' });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
});

// Start server
async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('⚠️  MongoDB connection failed during startup. Server will still start, but API may not function fully until DB is available.', err);
  }

  try {
    initSocket(server);
  } catch (err) {
    console.error('⚠️  Socket initialization failed:', err);
  }

  try {
    startWorker();
  } catch (err) {
    console.error('⚠️  Worker start failed:', err);
  }

  server.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🤖 AI Provider: ${env.AI_PROVIDER}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
