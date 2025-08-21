import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseModel } from "./BaseModel.js";
import { User } from "./User.js";

@Entity({ name: 'refresh_tokens'})
export class RefreshToken extends BaseModel{
    @Column({ type: 'varchar'})
    token?:string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt?:Date;

    @Column({ type: 'varchar', name: 'added_by' })
    addedBy?:string;

    @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'users' })
    user?: User;
}