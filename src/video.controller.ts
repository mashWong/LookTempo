import { Controller, Get, Res, HttpException, HttpStatus, Req, Query, UseGuards } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { LoggerService } from './service/loggers.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('video')
export class VideoController {
  constructor(
    private readonly LoggerService: LoggerService
  ) { }

  @Get('stream')
  async streamVideo(
    @Query('name') name: string,
    @Req() req,
    @Res() res
  ) {
    const range = req.headers.range;
    const referer = req.headers.referer;
    const allowedReferrer = ['http://20.39.199.107:9000/', 'http://localhost:9000/', 'http://localhost:5173/',
      'http://20.39.199.107/', 'http://looktempo.giize.com/'
    ];

    try {
      if (!range) {
        throw new HttpException('Requires Range header', 406)
      }
      if (!referer || !allowedReferrer.includes(referer)) {
        throw new HttpException('Requires Range header', 401)
      }
      if (!name) {
        throw new HttpException('error', 403)
      }

      const filePath = join(__dirname, '..', 'static', name + '.mp4');
      const stat = fs.statSync(filePath);

      const fileSize = stat.size;

      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      this.recordLogger(req.headers.cookie, name + ': ' + (end / fileSize).toFixed(2));

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);

    } catch (error) {
      throw new HttpException('Failed to stream video', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('download')
  @UseGuards(AuthGuard('jwt')) // 使用 JWT 认证守卫
  async downloadVideo(
    @Query('name') name: string,
    @Req() req,
    @Res() res
  ) {
    try {
      if (!name) {
        throw new HttpException('Video name is required', 403);
      }

      const filePath = join(__dirname, '..', 'static', name + '.mp4');
      const stat = fs.statSync(filePath);

      const fileSize = stat.size;

      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${name}.mp4"`,
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);

      this.recordLogger(req.headers.cookie, name);

    } catch (error) {
      throw new HttpException('Failed to download video', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  recordLogger(cookie: any, name: string) {
    const chinaTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    const list = cookie.split(';');
    list.forEach((item: string) => {
      if (item.indexOf('key=') !== -1) {
        const key = item.replace('key=', '').replace(/\s+/g, '');
        if (key === 'dfc0be52bd9b386bd229308d8eff2f8f' || key === 'ecc79ad93b7dea8b068f6856bbd99b10') return;

        this.LoggerService.debug(chinaTime + '  ' + key + ' ' + name + '');
      }
    })
  }
}