import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StaticFilterMiddleware } from './middleware/static-filter.middleware';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局启用 CORS
  app.enableCors({
    origin: true, // 允许所有源或指定具体的域名/域名列表
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 如果需要发送 cookie
    allowedHeaders: 'Content-Type,Authorization', // 允许的请求头
  });
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

  // 服务静态文件
  app.useStaticAssets('frontend', {
    prefix: '/',
  });
  app.useStaticAssets('frontend', {
    prefix: '/traces',
  });
  app.use('/images', new StaticFilterMiddleware().use);

  // 设置默认路由
  app.setBaseViewsDir('frontend');
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 9000);
}
bootstrap();
