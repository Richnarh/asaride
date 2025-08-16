import express from 'express';
import { DataSource } from 'typeorm';
import { setupUserRoutes } from './routes/userRoutes.js';
import { setupAuthRoutes } from './routes/authRoutes.js';
import { setupEmployeeRoutes } from './routes/employeeRoutes.js';

export function createApp(dataSource: DataSource) {
  const app = express();
  app.use(express.json());

  const routeConfigs = {
    '/auth': () => setupAuthRoutes(dataSource),
    '/users': () => setupUserRoutes(dataSource),
    '/employees': () => setupEmployeeRoutes(dataSource),
    // Add more routes here as needed, e.g.,
    // '/other': () => setupOtherRoutes(dataSource),
  };

  Object.entries(routeConfigs).forEach(([path, setup]) => {
    app.use(path, setup());
  });

  return app;
}