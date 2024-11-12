import { Controller, Get, Res, HttpException, HttpStatus, Req } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { promises as fsPromises } from 'fs';

@Controller('api/video')
export class VideoController {
  private filePath = join(__dirname, '..', 'static', '1000.mp4'); // 替换为你的视频文件路径

  @Get('stream')
  async streamVideo(@Req() req, @Res() res) {
    try {
      const range = req.headers.range;
      const referer = req.headers.referer;
      if (!range) {
        throw new HttpException('Requires Range header', 406)
      }
      if (!referer) {
        // console.error('reffer is not correct ' + referer);
        throw new HttpException('Requires Range header', 401)
      }

      const { size } = await fsPromises.stat(this.filePath);

      const CHUNK_SIZE = 800 * 1024;
      const start = Number(range.replace(/\D/g, ''));
      const end = Math.min(start + CHUNK_SIZE, size - 1);

      const contentLength = end - start + 1;
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, headers);

      const videoStream = createReadStream(this.filePath, { start, end });
      videoStream.pipe(res);
    } catch (error) {
      throw new HttpException('Failed to stream video', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}