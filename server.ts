import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { initDatabase, db } from './server/db';
import { authRouter } from './server/routes/auth';
import { roadmapsRouter } from './server/routes/roadmaps';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize Database (MongoDB or fallback storage)
  await initDatabase();

  // Health and status API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Software Engineer Roadmap API',
      database: db.isMongo() ? 'MongoDB (Connected)' : 'Persistent Document Storage (Active)',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/roadmaps', roadmapsRouter);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Roadmap Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
