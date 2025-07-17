import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'infinite-realty-hub-api',
  });
});

// API routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Infinite Realty Hub API v1',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
});

export default app;
