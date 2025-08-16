import { Router } from 'express';
import { DataSource } from 'typeorm';
import { UserService } from '../services/UserService';
import { User } from '../entities/User';
import { authenticateToken } from '../middleware/authMiddleware';
import { UserController } from '../controllers/UserController';

const router = Router();

export function setupUserRoutes(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  // Protect all user routes with JWT middleware
  router.use(authenticateToken);

  router.post('/', (req, res) => userController.createUser(req, res));
  router.get('/', (req, res) => userController.getAllUsers(req, res));
  router.get('/:id', (req, res) => userController.getUserById(req, res));
  router.put('/:id', (req, res) => userController.updateUser(req, res));
  router.delete('/:id', (req, res) => userController.deleteUser(req, res));

  return router;
}