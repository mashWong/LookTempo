import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StaticFilterMiddleware } from './middleware/static-filter.middleware';
import * as session from 'express-session';
import * as passport from 'passport';
import { IpFilterMiddleware } from './middleware/ip-filter.middleware';
import { readFileSync } from 'fs';
import { env } from 'process';
import { Request, Response } from 'express';

async function bootstrap() {
  console.log(env.npm_lifecycle_event);
  // HTTPS 配置
  const httpsOptions = env.npm_lifecycle_event === 'start:dev'
    ? {} : {
      key: readFileSync('/etc/letsencrypt/live/looktempo.giize.com/privkey.pem'),
      cert: readFileSync('/etc/letsencrypt/live/looktempo.giize.com/fullchain.pem'),
    };

  const app = env.npm_lifecycle_event === 'start:dev' ?
    await NestFactory.create<NestExpressApplication>(AppModule) :
    await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });

  // 设置session middleware
  app.use(
    session({
      secret: 'aaaa', // 替换为你的秘密key
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Passport初始化
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(new IpFilterMiddleware().use);
  // 服务静态文件
  app.useStaticAssets('frontend', {
    prefix: '/',
  });
  app.useStaticAssets('frontend', {
    prefix: '/traces',
  });
  app.useStaticAssets('frontend', {
    prefix: '/music',
  });
  app.useStaticAssets('frontend', {
    prefix: '/50percent',
  });
  app.use('/images', new StaticFilterMiddleware().use);

  // 设置默认路由
  app.setBaseViewsDir('frontend');
  app.setViewEngine('hbs');

  if (env.npm_lifecycle_event === 'start:dev') {
    await app.listen(process.env.PORT ?? 9000);
  } else {
    // 创建 HTTP 服务器用于重定向
    const httpApp = await NestFactory.create(AppModule);
    httpApp.use((req: Request, res: Response) => {
      // res.redirect(301, `https://${req.hostname}${req.url}`);
    });
    await httpApp.listen(process.env.PORT ?? 9000);

    await app.listen(443, '0.0.0.0');
  }
}
bootstrap();
