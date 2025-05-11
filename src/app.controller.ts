import { Controller, Get, Post, Req, Res, Param, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { LoggerService } from './service/loggers.service';
import { UserService } from './service/user.service';
import { B2Service } from './service/B2.service';

const NotLog = [
  'JqXp66ght5',
  '7ryeUoUUv2',
  'pA2HEZki41',
  'Vnj7PZtvlK',
  '9lzZz3cPrT'
];

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly LoggerService: LoggerService,
    private readonly userService: UserService,
    private readonly b2Service: B2Service
  ) { }

  @Get('list')
  async getPngFiles(@Req() req: Request, @Res() res: Response): Promise<Response> {

    try {
      const mapFiles = [
        'IVE - I AM.avif',
        'Nonono - Apink.avif',
        'Bar Bar Bar - Crayon Pop.avif',
        'APT - ROSE.avif',
        'thumbs up - momoland.avif',
        'Illusion - DuaLipa.avif',
        'TOO BAD - GD.avif',
        'UP - KARINA.avif',
        'Really Like You - BABYMONSTER.avif',
        'MINNIE - HER.avif',
        'AOA - like a cat.avif',
        'IVE - REBEL HEART.avif',
        "Girls Generation - taxi.avif",
        'Amateur - Nice Body.avif',
        'ITZY - WANNABE.avif',
        'Jun Hyoseong - Into you.avif',
        'Red Velvet X Aespa - Beautiful Christmas.avif',
        'T-ARA - 숨바꼭질.avif',
        'jennie - Mantra.avif',
        'Miniskirt - AOA.avif',
        'girls - aespa.avif',
        'Whiplash - aespa.avif',
        'LIKE THAT - BABYMONSTER.avif',
        'FOREVER - BABYMONSTER.avif'
      ];
      // const files = await this.b2Service.getBatchPresignedUrlsByNames('avif', mapFiles)

      // 新增缓存控制头（关键修改部分）
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7天缓存

      return res.json({ files: mapFiles });
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

  @Get('goods')
  async getAllGoods(@Res() res: Response): Promise<Response> {
    console.log('goods')
    try {
      let list = await this.userService.findAllFeedback();
      res.json(list);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Get('presigned-url/:filePath')
  async getPresignedUrl(
    @Param('filePath') filePath: string,
    @Query('validDuration') validDuration?: number,
  ) {
    try {
      const url = await this.b2Service.getPresignedUrl(filePath, validDuration);
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('B2init')
  async initialize() {
    try {
      await this.b2Service.initialize();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('log')
  async logger(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const chinaTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    this.recordLogger(req.headers.cookie, chinaTime, req.query.zone.toString());

    return res.json({ success: true });
  }

  recordLogger(cookie: any, chinaTime: string, zone: string) {
    const list = cookie.split(';');
    list.forEach((item: string) => {
      if (item.indexOf('key=') !== -1) {
        const key = item.replace('key=', '').replace(/\s+/g, '');
        if (NotLog.includes(key)) return;
        this.LoggerService.log(chinaTime + '  ' + key + ' ' + zone + '');
      }
    })
  }
}

