import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Film {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    number: string;

    @Column()
    isFree: number;

    @Column()
    poster: string;
}