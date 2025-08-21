import { BaseEntity, BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ulid } from 'ulid';

export class BaseModel extends BaseEntity{
    @PrimaryColumn('varchar', { length: 100, nullable: false })
    id?:string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date = new Date();

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt?: Date;

    @BeforeInsert()
    generateId() {
        this.id = ulid();
    }
}