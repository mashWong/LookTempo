import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as path from 'path';

@Injectable()
export class StaticFilterMiddleware implements NestMiddleware {
  private readonly logger = new Logger(StaticFilterMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    const referer = req.headers.referer;
    const allowedReferrer = ['http://20.39.199.107:9000/', 'http://localhost:9000/', 'http://localhost:5173/',
      'http://20.39.199.107/', 'http://looktempo.giize.com/'
    ];

    if (!referer || !allowedReferrer.includes(referer)) {
      this.logger.error('referer not allowed:', referer);
      res.status(403).send('Forbidden');
      return;
    }

    // 根据请求路径决定返回哪个目录下的静态文件
    let staticDir = path.join(__dirname, '../../', 'static');

    // 使用 Express 的静态文件服务中间件
    express.static(staticDir)(req, res, next);

  }
}