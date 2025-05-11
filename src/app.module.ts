import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppService } from './app.service';
import { VideoController } from './video.controller';
import { AppController } from './app.controller';
import { IpFilterMiddleware } from './middleware/ip-filter.middleware';
// import { HttpsRedirectMiddleware } from './middleware/https-redirect.middleware';
import { LoggerService } from './service/loggers.service';
import { LoggersController } from './controller/logger.controller';
import { TwitterAuthService } from './service/twitter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './module/user.module';
import { B2Controller } from './controller/b2.controller';
import { B2Service } from './service/B2.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'looktempo.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CacheModule.register({
      ttl: 0, // 默认禁用全局缓存
      max: 100, // 最大缓存项
      isGlobal: true
    }),
    UserModule,
  ],
  controllers: [VideoController, AppController, LoggersController],
  providers: [AppService, LoggerService, TwitterAuthService, B2Service],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IpFilterMiddleware)
      .exclude('/logs/access')
      .exclude('/logs/video')
      .forRoutes('*');
  }
}
