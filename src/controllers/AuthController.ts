import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
const { isEmpty } = _;

import { AuthService } from '../services/AuthService.js';
import { HttpStatus } from '../utils/constants.js';
import { DataSource } from 'typeorm';
import { AppError } from '../utils/errors.js';
import { Js } from '../utils/validators.js';
import { AuthRequest } from '../models/model.js';
import { NextFunction } from 'express-serve-static-core';
import { logger } from '../utils/logger.js';
import { User } from '../entities/User.js';
import { Otp } from 'src/entities/Otp.js';

export class AuthController {
  private authService:AuthService;
  private readonly dataSource:DataSource;
  constructor(dataSource: DataSource) {
    this.authService = new AuthService(dataSource);
    this.dataSource = dataSource;
  }
  
  async login(req: Request, res: Response, next:NextFunction) {
    try {
      const { emailAddress, phoneNumber } = req.body as AuthRequest;
      if (!emailAddress && !phoneNumber) {
        throw new AppError('Email or phone is required', HttpStatus.BAD_REQUEST);
      }

      let isEmail = false, isPhone = false;

      if(emailAddress){
        isEmail = Js.isValidEmail(emailAddress).isValid;
      }
      if(phoneNumber){
        isPhone = Js.isValidPhone(phoneNumber).isValid;
      }

      let result = await this.authService.login(isEmail ? emailAddress : phoneNumber);
      if (isEmpty(result)) {
        if (!process.env.JWT_SECRET) {
          throw new AppError('JWT_SECRET is not defined in environment variables', HttpStatus.NOT_FOUND);
        }
        const user = await this.authService.createUser(emailAddress,phoneNumber);
        const refreshToken = await this.authService.createRefreshToken(user.id!);
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '5h' });
        result = { accessToken, refreshToken, user };
      }
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.status(HttpStatus.OK).json({ data: { accessToken: result?.accessToken, refreshToken: result.refreshToken, user: result?.user }});
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
  
  async logoutUser(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
          const refreshToken = req.cookies.refreshToken;
          const { userId } = req.params;
          if (isEmpty(refreshToken)) {
              throw new AppError(`Refresh token is required`, HttpStatus.BAD_REQUEST);
          }
          if (isEmpty(userId) || userId === 'undefined') {
              throw new AppError(`UserId is required`, HttpStatus.BAD_REQUEST);
          }
          await this.authService.logoutUser(refreshToken,userId);
          res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production'});
          res.status(HttpStatus.OK).json({ message: 'Logout successful' });
      } catch (error) {
        logger.error(error);
          next(error);
      }
  }

  public refreshToken = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const token = req.cookies.refreshToken;
      if(!token){
          throw new AppError('No refresh token provided', HttpStatus.UNAUTHORIZED);
      }
      const { accessToken, refreshToken } = await this.authService.refreshAccessToken(token);
      res.status(HttpStatus.OK).json({ message: 'Token refreshed successfully', accessToken, refreshToken});
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  public verifyOtp = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const { userId, code } = req.body;
        if(isEmpty(userId)){
          throw new AppError('UserId is required', HttpStatus.BAD_REQUEST);
        }
        if(isEmpty(code)){
          throw new AppError('Otp Code is required', HttpStatus.BAD_REQUEST);
        }
        await this.authService.verifyOttp(userId, code);
        const user = await this.dataSource.getRepository(User).findOneBy({ id: userId });
        if (!user) {
            throw new AppError('User not found', HttpStatus.NOT_FOUND);
        }
        await this.dataSource.getRepository(Otp).delete(code);
        res.status(HttpStatus.OK).json({ message: 'Account verified successfully' });
    } catch (error) {
        next(error);
    }
  }
}