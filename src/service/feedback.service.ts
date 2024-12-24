import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private feedbackRepository: Repository<Feedback>,
    ) { }

    findAll(): Promise<Feedback[]> {
        return this.feedbackRepository.find();
    }

    addFeedback(content: string, user: any): Promise<Feedback> {
        return this.feedbackRepository.save({
            context: content,
            userId: user.userId,
            userName: user.name,
            creatTime: new Date().getTime().toString()
        });
    }
}