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

    this.recordLogger(req.headers.cookie);

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

  recordLogger(cookie: any) {
    const list = cookie.split(';');
    const keyList = ['acb8da6c7c2d630d12559c1c5280ae96', '']
  
    list.forEach(item => {
      if (item.indexOf('key=') !== -1) {
        const key = item.replace('key=', '');
        console.log(key);
        if (!keyList.includes(key)) {
          let time = new Date();
          const month = String(time.getMonth() + 1).padStart(2, '0');
          const day = String(time.getDate()).padStart(2, '0');
          const hours = String(time.getHours()).padStart(2, '0');
          const minutes = String(time.getMinutes()).padStart(2, '0');
          this.LoggerService.log(month + '月' + day + '日' + hours + '时' + minutes + '分' + ': ' + key);
        }
      }
    })
  }
}

