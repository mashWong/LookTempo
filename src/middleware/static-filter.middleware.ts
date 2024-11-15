import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as path from 'path';

@Injectable()
export class StaticFilterMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const referer = req.headers.referer || req.headers.referrer;
    const allowedReferrer = 'http://57.155.50.233:9000/';

    if (!referer || referer !== allowedReferrer) {
      res.status(403).send('Forbidden');
      return;
    }

    // 根据请求路径决定返回哪个目录下的静态文件
    let staticDir = path.join(__dirname, '../../', 'static');

    // 使用 Express 的静态文件服务中间件
    express.static(staticDir)(req, res, next);

  }
}