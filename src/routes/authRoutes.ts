import { Router } from 'express';
import { DataSource } from 'typeorm';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();
export const setupAuthRoutes = (dataSource: DataSource) => {
  const authController = new AuthController(dataSource);

  router.post('/login', authController.login.bind(authController));
  router.post('/refresh-token/:userId', authController.refreshToken.bind(authController));
  router.post('/verify-otp', authController.verifyOtp.bind(authController));
  router.post('/logout/:userId', authenticateToken, authController.logoutUser.bind(authController));

  return router;
}