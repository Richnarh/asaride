import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from './BaseModel.js';
import { User } from './User.js';

@Entity({ name: 'otps'})
export class Otp extends BaseModel{

  @Column({ type: 'varchar', nullable: true})
  code?:string;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'users' })
  user?: User;
  
  @Column({ name: 'expires_at', type: 'date' })
  expiresAt?:Date;
}