import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StaticFilterMiddleware } from './middleware/static-filter.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
