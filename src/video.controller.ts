import { Controller, Get, Res, HttpException, HttpStatus, Req, Query } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

@Controller('video')
export class VideoController {

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
}