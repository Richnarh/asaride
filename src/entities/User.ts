import { Entity, Column, OneToOne } from 'typeorm';
import { BaseModel } from './BaseModel.js';
import { Otp } from './Otp.js';

@Entity({ name: 'users' })
export class User extends BaseModel {
  @Column({ type: 'varchar', name: 'display_name', nullable: true })
  name?: string;

  @Column({ unique: true, type: 'varchar', name: 'email_address', length:254 })
  emailAddress?: string;

  @Column({ unique: true, type: 'varchar', name: 'phone_number', length: 50})
  phoneNumber?: string;

  @Column({ type: 'varchar', name: 'image_path', nullable: true})
  imagePath?: string;

  @OneToOne(() => Otp, (otp) => otp.user)
  otp?: Otp;
}