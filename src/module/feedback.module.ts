import { Module } from '@nestjs/common';
import { FeedbackService } from '../service/feedback.service';
import { FeedbackController } from '../controller/feedback.controller';

@Module({
    providers: [FeedbackService],
    controllers: [FeedbackController],
    exports: [FeedbackService],
})
export class FeedbackModule { }