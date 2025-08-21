import { NextFunction, Request, Response } from 'express';
import { DataSource, Repository } from 'typeorm';

import { User } from '../entities/User.js';
import { HttpStatus } from '../utils/constants.js';
import { Js } from '../utils/validators.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class UserController {
  private userRepository: Repository<User>;
  constructor(readonly dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  async createUser(req: Request, res: Response, next:NextFunction) {
    try {
      const { phoneNumber, emailAddress, name, id } = req.body;
      if (!phoneNumber && !emailAddress) {
        throw new AppError('Phone Number or Email Address is required', HttpStatus.BAD_REQUEST);
      }
      let isEmail = false, isPhone = false;
      const user = new User();
      user.name = name;
      if(emailAddress){
        isEmail = Js.isValidEmail(emailAddress).isValid;
      }
      if(phoneNumber){
        isPhone = Js.isValidPhone(phoneNumber).isValid;
      }

      if(isEmail){
        user.emailAddress = emailAddress
      }
      if(isPhone){
        user.phoneNumber = phoneNumber;
      }
      
      const usr = await this.userRepository.save(user);

      res.status(id ? HttpStatus.OK : HttpStatus.CREATED).json({ data:usr });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next:NextFunction) {
    try {
      const users = await this.userRepository.find();
      res.status(HttpStatus.OK).json({ data: users });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next:NextFunction) {
    try {
      if(!req.params.id){
        throw new AppError('UserId is required', HttpStatus.BAD_REQUEST);
      }
      const user = await this.userRepository.findOneBy({ id: req.params.id});
      if (!user) {
        throw new AppError('User not found', HttpStatus.NOT_FOUND)
      }
      res.status(HttpStatus.OK).json({ data:user });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next:NextFunction) {
    try {
      if(req.params.id){
        throw new AppError('UserId is required', HttpStatus.BAD_REQUEST);
      }
      const success = await this.userRepository.delete(req.params.id);
      if (!success) {
        throw new AppError('User not found', HttpStatus.NOT_FOUND);
      }
      res.status(HttpStatus.OK).json({message: 'delete successful'});
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
}