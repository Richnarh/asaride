import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const user = await this.authService.register({ name, email, password });
      res.status(201).json(user);
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error registering user', error });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      const result = await this.authService.login(email, password);
      if (!result) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      res.json({ token: result.token, user: result.user });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }
}