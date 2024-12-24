import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userName: string;

    @Column()
    userId: string;

    @Column()
    context: string;

    @Column()
    creatTime: string;
}