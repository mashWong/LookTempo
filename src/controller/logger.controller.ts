import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('logs')
export class LoggersController {
    @Get('access')
    getLoggers(@Res() res: Response) {
        const filePath = path.join(__dirname, '../../logs/combined.log');
        let logsContent = fs.readFileSync(filePath, 'utf-8');

        return res.json(logsContent);
    }

    @Get('video')
    getVideologger(@Res() res: Response) {
        const filePath = path.join(__dirname, '../../logs/info.log');
        let logsContent = fs.readFileSync(filePath, 'utf-8');

        return res.json(logsContent);
    }
}

