// ==========================================
// Express Application Factory
// ==========================================

import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares/auth.js';
import config from './config/env.js';

export const createApp = () => {
  const app = express();

  // ==========================================
  // Middleware
  // ==========================================
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==========================================
  // Health Check Route
  // ==========================================
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'active',
      message: 'Backend Server is Running',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};
