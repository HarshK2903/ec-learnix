import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import { startWorker } from './workers/processing.worker.js';
import { apiRateLimit } from './middleware/rateLimit.middleware.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);

app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimit);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (env.NODE_ENV === 'production') {
  // From server/dist -> ../../client/dist
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  // SPA fallback for non-API routes
  app.get(/^\/(?!api).*/, (_req, res) => {
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
  await connectDB();
  initSocket(server);
  startWorker();

  server.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🤖 AI Provider: ${env.AI_PROVIDER}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
