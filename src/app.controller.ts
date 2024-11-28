import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { LoggerService } from './service/loggers.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly LoggerService: LoggerService
  ) { }

  @Get('list')
  async getPngFiles(@Req() req: Request, @Res() res: Response): Promise<Response> {

    const chinaTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    this.recordLogger(req.headers.cookie, chinaTime, req.query.zone.toString());

    try {
      const files = await this.appService.getPngFiles();
      return res.json({ files });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Get('loggers')
  getLoggers(@Res() res: Response) {
    const filePath = path.join(__dirname, '../logs/combined.log');
    let logsContent = fs.readFileSync(filePath, 'utf-8');

    return res.json(logsContent);
  }

  @Get('videologger')
  getVideologger(@Res() res: Response) {
    const filePath = path.join(__dirname, '../logs/info.log');
    let logsContent = fs.readFileSync(filePath, 'utf-8');

    return res.json(logsContent);
  }

  recordLogger(cookie: any, chinaTime: string, zone: string) {
    const list = cookie.split(';');
    list.forEach((item: string) => {
      if (item.indexOf('key=') !== -1) {
        const key = item.replace('key=', '');
        this.LoggerService.log(chinaTime + '  ' + key + ' ' + zone + '');
      }
    })
  }
}

