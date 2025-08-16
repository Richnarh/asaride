import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';

import { setupUserRoutes } from './routes/userRoutes';
import { setupAuthRoutes } from './routes/authRoutes';
import { setupEmployeeRoutes } from './routes/employeeRoutes';
import { initializeDatabase } from './config/dataSource';
import { logger } from './utils/logger';
import { errorMiddleware } from './middleware/errorMiddleware';

const createApp = async (): Promise<express.Application> => {
  const dataSource: DataSource = await initializeDatabase();

  const app = express();
  const baseApi = '/api/v1'
  const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'UserId'],
  };

  dotenv.config();
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }))
  app.use(helmet());
  app.use(cors(corsOptions));

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  const routeConfigs = {
    '/auth': () => setupAuthRoutes(dataSource),
    '/users': () => setupUserRoutes(dataSource),
    '/employees': () => setupEmployeeRoutes(dataSource),
  };

  Object.entries(routeConfigs).forEach(([path, setup]) => {
    app.use(`${baseApi}/${path}`, setup());
  });

  app.use(errorMiddleware);
  return app;
};

export default createApp;