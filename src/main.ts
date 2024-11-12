import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 服务静态文件
  app.useStaticAssets('frontend', {
    prefix: '/', // 可以自定义前缀
  });

  // 设置默认路由
  app.setBaseViewsDir('frontend');
  app.setViewEngine('hbs'); // 使用 Handlebars 模板引擎，也可以选择其他模板引擎

  await app.listen(process.env.PORT ?? 9000);
}
bootstrap();
