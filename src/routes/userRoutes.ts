import { Router } from 'express';
import { DataSource } from 'typeorm';
import { UserController } from '../controllers/UserController.js';

const router = Router();

export function setupUserRoutes(dataSource: DataSource) {
  const userController = new UserController(dataSource);

  // Protect all user routes with JWT middleware
  // router.use(authenticateToken);

  router.post('/', userController.createUser.bind(userController));
  router.get('/', userController.getAllUsers.bind(userController));
  router.get('/:id', userController.getUserById.bind(userController));
  router.delete('/:id', userController.deleteUser.bind(userController));

  return router;
}