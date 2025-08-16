import { Repository } from 'typeorm';
import { User } from '../entities/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  constructor(private userRepository: Repository<User>) {}

  async register(data: RegisterData) {
    const existingUser = await this.userRepository.findOneBy({ email: data.email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new User();
    user.name = data.name;
    user.email = data.email;
    user.password = hashedPassword;
    return await this.userRepository.save(user);
  }

  async login(email: string, password: string) {
  const user = await this.userRepository.findOneBy({ email });

  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

  async getUserById(id: string) {
    return await this.userRepository.findOneBy({ id });
  }
}