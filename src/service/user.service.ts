import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    findOneByUserId(userId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { userId } });
    }

    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

    async create(user: Partial<User>): Promise<User> {

        // 设置默认值
        const newUser: User = {
            id: user.id,
            userId: user.userId,
            name: user.name,
            subscribed: '0',
            avatar: user.avatar,
            email: user.email ?? '',
            password: user.password ?? '',
            source: user.source ?? '',
            creatTime: new Date().getTime().toString(),
            checkSubTime: ''
        }

        return this.userRepository.save(newUser);
    }

    async updatePayment(userId: string, subscribed: string): Promise<boolean> {
        let res = await this.userRepository.update({ userId: userId },
            { subscribed: subscribed, checkSubTime: subscribed === '0' ? '' : new Date().getTime().toString() });
        if (res.affected === 1) {
            return true;
        } else {
            return false;
        }
    }

    async updateSouces(userId: string, source: string): Promise<boolean> {
        let res = await this.userRepository.update({ userId: userId },
            { source: source });
        return res.affected === 1;
    }
}