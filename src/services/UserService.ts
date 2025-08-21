import { User } from "src/entities/User.js";
import { Repository, DataSource } from "typeorm";

export class UserService{
   private userRepository: Repository<User>;
     constructor(dataSource: DataSource) {
       this.userRepository = dataSource.getRepository(User);
     }

    async createUser(user:User){
        return this.userRepository.save(user);
    }
}