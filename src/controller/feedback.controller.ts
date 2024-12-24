import { Controller, Get, Post, Req, Res, UseGuards, Body, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedbackService } from 'src/service/feedback.service';

@Controller('api/feedback')
export class FeedbackController {
    constructor(
        private feedbackService: FeedbackService,
    ) { }

    @Get('/')
    async findAll() {

    }

    @Post('feedback')
    @UseGuards(AuthGuard('jwt'))
    async doFeedback(@Body() body: { content: string }, @Req() @Request() req) {
        if (body.content) this.feedbackService.addFeedback(body.content, req.user);
        return 'ok'
    }

}