import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import swaggerUi from 'swagger-ui-express';

import { setupUserRoutes } from './routes/userRoutes.js';
import { setupAuthRoutes } from './routes/authRoutes.js';
import { initializeDatabase } from './config/dataSource.js';
import { logger } from './utils/logger.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import swaggerSpec from './swagger.json' with { type: 'json' };

const createApp = async (): Promise<express.Application> => {
  const dataSource: DataSource = await initializeDatabase();

  const app = express();
  const baseApi = '/api/v1'
  const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'UserId'],
  };

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }))
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(`${baseApi}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((req, res, next) => {
    logger.info(`${req.method} ${baseApi}${req.url}`);
    next();
  });

  const routeConfigs = {
    'auth': () => setupAuthRoutes(dataSource),
    'users': () => setupUserRoutes(dataSource),
  };

  Object.entries(routeConfigs).forEach(([path, setup]) => {
    app.use(`${baseApi}/${path}`, setup());
  });

  app.use(errorMiddleware);
  return app;
};
const startEngine = async () => {
  const app = await createApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger UI available at http://localhost:${PORT}/api/v1/docs`)
  });
}

startEngine().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});