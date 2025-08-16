import { Entity, PrimaryColumn, Column, BaseEntity, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryColumn('varchar', { length: 26, nullable: false })
  id?: string;

  @Column({type: 'varchar'})
  name?: string;

  @Column({ unique: true, type: 'varchar' })
  email?: string;

  @Column({type: 'varchar'})
  password?: string;

  @CreateDateColumn({ name: 'created_at', type: 'date' })
  createdAt: Date = new Date();

  @UpdateDateColumn({ name: 'lastupdated_at', type: 'date' })
  lastUpdatedAt?: Date;

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}