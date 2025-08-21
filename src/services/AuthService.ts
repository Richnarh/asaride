import { DataSource, Equal, MoreThanOrEqual, Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import isEmpty from 'lodash';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { User } from '../entities/User.js';
import { AppError } from '../utils/errors.js';
import { HttpStatus } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { Otp } from '../entities/Otp.js';
import { EmailService } from './emailService.js';
import { SmsService } from './smsService.js';
import { RefreshToken } from '../entities/RefreshToken.js';

export class AuthService {
  private userRepository: Repository<User>;
  private otpRepository:Repository<Otp>;
  private tokenRepository:Repository<RefreshToken>;
  private emailService:EmailService;
  private SALT_ROUNDS = 10;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.otpRepository = dataSource.getRepository(Otp);
    this.tokenRepository = dataSource.getRepository(RefreshToken);
    this.emailService = new EmailService();
  }

  public login = async (emailPhone: string) => {
    const user = await this.userRepository.findOneBy([
        { emailAddress: Equal(emailPhone) },
        { phoneNumber: Equal(emailPhone) },
    ]);

    if (!user) return null;

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET is not defined in environment variables', HttpStatus.NOT_FOUND);
    }
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '5h' });
    const token = await this.createRefreshToken(user.id!);
    await this.createOtp(user,this.getOtp());
    return { accessToken,refreshToken:token, user };
  }

  async getUserById(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  async createOtp(user: User, code: string): Promise<Otp> {
    const existingOtp = await this.otpRepository.findOneBy({ user: { id: user.id } });
    let createdOtp:Otp;
    if (existingOtp) {
      existingOtp.code = code;
      existingOtp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      createdOtp = await this.otpRepository.save(existingOtp);
    } else {
      const otp = new Otp();
      otp.code = code;
      otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      otp.user = user;
      createdOtp = await this.otpRepository.save(otp);
    }
    logger.info('OTP created successfully', { user: user.id, otpId: createdOtp.id });
    return createdOtp;
  }

  async createUser(emailAddress:string, phoneNumber:string){
    try {
      const user = new User();
      user.emailAddress = emailAddress;
      user.phoneNumber = phoneNumber;
      user.name = emailAddress;
      const newUser = await this.userRepository.save(user);
      const otpCode = this.getOtp();
      await this.createOtp(newUser, otpCode);
      if(!isEmpty(emailAddress)){
        this.emailService.sendOtpEmail(emailAddress, otpCode);
      }
      if(!isEmpty(phoneNumber)){
        SmsService.sendOtpSms(phoneNumber, otpCode);
      }
      return newUser;
    } catch (error) {
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private getOtp(){
    return Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
  }

  async createRefreshToken(id: string){
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(token, this.SALT_ROUNDS);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const user = await this.userRepository.findOneBy({ id });
      if(!user){
        throw new AppError('UserId is required', HttpStatus.BAD_REQUEST);
      }
      const refreshToken = new RefreshToken();
      refreshToken.user = user!;
      refreshToken.token = hashedToken;
      refreshToken.expiresAt = expiresAt;
      refreshToken.addedBy = user?.emailAddress;
      await this.tokenRepository.save(refreshToken);
      logger.info('Refresh token created successfully', { tokenId: refreshToken.id });
      return token;
    } catch (error) {
      console.log(error)
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
      const tokens = await this.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findOneBy({ id: tokens.user?.id });
      if (!user) {
        throw new AppError('Invalid refresh token', HttpStatus.BAD_REQUEST);
      }
      await this.tokenRepository.remove(tokens);
      const accessToken = jwt.sign({ id: user.id, emailAddress: user.emailAddress }, process.env.JWT_SECRET!, { expiresIn: '5h'});
      const token = await this.createRefreshToken(user.id!);
      logger.info('Access token refreshed successfully', { userId: user.id });
      return { accessToken, refreshToken: token! };
  }

  async verifyRefreshToken(token: string): Promise<RefreshToken> {
    const tokenRecord = await this.tokenRepository
    .createQueryBuilder('refreshToken')
    .where('refreshToken.expiresAt >= :currentDate', { currentDate: new Date() })
    .getOne();
    
    if (!tokenRecord) {
      throw new AppError('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
    }
    const isMatch = await bcrypt.compare(token, tokenRecord.token!);
    if (!isMatch) {
      throw new AppError('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
    logger.info('Refresh token verified successfully', { userId: tokenRecord.user });
    return tokenRecord;
  }

  async findRefreshToken(token: string, user: User): Promise<RefreshToken | null> {
    const tokenRecord = await this.tokenRepository
      .createQueryBuilder('refreshToken')
      .where('refreshToken.user = :userId', { userId: user.id })
      .andWhere('refreshToken.expiresAt >= :currentDate', { currentDate: new Date() })
      .getOne();

    if (!tokenRecord) return null;
    
    const isMatch = await bcrypt.compare(token, tokenRecord.token!);
    return isMatch ? tokenRecord : null;
  }

  logoutUser = async (refreshToken: string, userId:string) => {
    const user = await this.userRepository.findOneBy({ id: userId });
    if(!user){
      throw new AppError('User not found', HttpStatus.BAD_REQUEST);
    }
    const tokenRecord = await this.findRefreshToken(refreshToken,user);
    if (tokenRecord) {
        await this.tokenRepository.remove(tokenRecord);
        logger.info('User logged out successfully', { userId: tokenRecord.user });
    } else {
        throw new AppError('Refresh token not found for logout', HttpStatus.NOT_FOUND);
    }
  }

  public verifyOttp = async (userId:string, code: string) => {
    const otp = this.otpRepository.findOne({
      where: {
        user: {id: userId },
        code: code,
        expiresAt: MoreThanOrEqual(new Date()),
      }
    })
    if (!otp){
        throw new AppError('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }
    return otp;
  }
}