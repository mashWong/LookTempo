import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    userId: string;

    // subscribeId or 0
    @Column()
    subscribed: string;

    // 上次检查订阅状态的时间
    @Column()
    checkSubTime: string;

    @Column()
    email: string;

    @Column()
    password: string;

    // x email google
    @Column()
    source: string;

    @Column()
    avatar: string;

    // 余额
    @Column()
    balance: string;

    // 注册的时间戳
    @Column()
    creatTime: string;
}