import { Entity, PrimaryColumn, Column, BaseEntity, BeforeInsert, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ulid } from 'ulid';
import { User } from './User'; // Import the User entity

@Entity()
export class Employee extends BaseEntity {
  @PrimaryColumn('varchar', { length: 26, nullable: false })
  id?: string;

  @Column('varchar')
  name?: string;

  @Column({ unique: true, type: 'varchar' })
  email?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy?: User;

  @CreateDateColumn({ name: 'created_at', type: 'date' })
  createdDate?: Date = new Date();

  @UpdateDateColumn({ name: 'lastupdated_at', type: 'date' })
  lastUpdated?: Date;

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}