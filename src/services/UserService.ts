import { Repository } from 'typeorm';
import { User } from '../entities/User';

interface UserData {
  name?: string;
  email?: string;
}

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async createUser(data: UserData) {
    const user = new User();
    user.name = data.name!;
    user.email = data.email!;
    return await this.userRepository.save(user);
  }

  async getAllUsers() {
    return await this.userRepository.find();
  }

  async getUserById(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  async updateUser(id: string, data: UserData) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    return await this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return false;
    }
    await this.userRepository.remove(user);
    return true;
  }
}