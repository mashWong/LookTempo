import { Controller, Get, Param, Query } from '@nestjs/common';
import { B2Service } from '../service/B2.service';

@Controller('b2')
export class B2Controller {
    constructor(private readonly b2Service: B2Service) { }

    @Get('presigned-url/:filePath')
    async getPresignedUrl(
        @Param('filePath') filePath: string,
        @Query('validDuration') validDuration?: number,
    ) {
        console.log('getPresignedUrl', filePath, validDuration);
        try {
            const url = await this.b2Service.getPresignedUrl(filePath, validDuration);
            return { success: true, url };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    
}