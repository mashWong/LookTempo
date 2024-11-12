import { Controller, Get, HttpStatus, Res, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as crypto from 'crypto';
import path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return 'hhh';
  }

  @Get('video')
  async getVideo(@Request() req, @Res() res: Response) {
    const referer = req.headers['referer'];
    if (referer !== 'http://localhost:5173/') {
      return 'error';
    }

    // const readStream = fs.createReadStream('');

    // 假设我们使用AES-256-CBC进行加密
    // const algorithm = 'aes-256-cbc';
    // const key = crypto.randomBytes(32); // 256位密钥
    // const iv = crypto.randomBytes(16); // 16字节初始向量

    console.log(req.headers.range)
    let str = req.headers.range.replace('bytes=', '')
    let start = parseInt(str.split('-')[0])
    let end = parseInt(str.split('-')[1])

    // 加密流
    // const encryptStream = crypto.createCipheriv(algorithm, key, iv);
    // readStream.pipe(encryptStream);

    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.setHeader('Content-Disposition', 'attachment; filename="encrypted_video.enc"');
    // res.setHeader('Content-Transfer-Encoding', 'binary');

    let readStream = readVideoSegment(start, end)
    readStream.pipe(res);
  }
}

function readVideoSegment(start: number, end: number) {
  const readStream = fs.createReadStream('/Users/blast/WebstormProjects/nest/mumen-nest/src/static/24.mp4', { start, end });
  return readStream;
}
