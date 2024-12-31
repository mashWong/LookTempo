import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { LoggerService } from './service/loggers.service';
import { UserService } from './service/user.service';


@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly LoggerService: LoggerService,
    private readonly userService: UserService,
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

  @Get('user')
  async getAllUser(@Req() req: Request, @Res() res: Response): Promise<Response> {
    try {
      let userList = await this.userService.findAll();
      res.json(userList);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Get('feedback')
  async getAllFeedback(@Res() res: Response): Promise<Response> {
    try {
      let list = await this.userService.findAllFeedback();
      res.json(list);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  recordLogger(cookie: any, chinaTime: string, zone: string) {
    const list = cookie.split(';');
    list.forEach((item: string) => {
      if (item.indexOf('key=') !== -1) {
        const key = item.replace('key=', '').replace(/\s+/g, '');
        if (key === 'dfc0be52bd9b386bd229308d8eff2f8f' || key === 'ecc79ad93b7dea8b068f6856bbd99b10') return;
        this.LoggerService.log(chinaTime + '  ' + key + ' ' + zone + '');
      }
    })
  }
}

