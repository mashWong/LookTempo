import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Logs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @Column()
    userName: string;

    @Column()
    action: string;

    @Column()
    creatTime: string;
}