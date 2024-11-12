import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StaticMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 在这里可以添加你想要的逻辑，例如日志记录、请求验证等
    console.log(`Static resource request: ${req.url}`);

    // 继续处理请求
    next();
  }
}