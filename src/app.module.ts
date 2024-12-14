import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppService } from './app.service';
import { VideoController } from './video.controller';
import { AppController } from './app.controller';
import { IpFilterMiddleware } from './middleware/ip-filter.middleware';
import { LoggerService } from './service/loggers.service';
import { LoggersController } from './controller/logger.controller';
import { TwitterService } from './service/twitter.service';
import { AuthController } from './controller/auth.controller';


@Module({
  imports: [],
  controllers: [VideoController, AppController, LoggersController, AuthController],
  providers: [AppService, LoggerService, TwitterService],
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
