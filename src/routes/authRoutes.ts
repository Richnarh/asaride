import { Router } from 'express';
import { DataSource } from 'typeorm';
import { AuthService } from '../services/AuthService.js';
import { User } from '../entities/User.js';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();

export function setupAuthRoutes(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));

  return router;
}