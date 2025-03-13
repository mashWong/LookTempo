import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppService } from './app.service';
import { VideoController } from './video.controller';
import { AppController } from './app.controller';
import { IpFilterMiddleware } from './middleware/ip-filter.middleware';
import { LoggerService } from './service/loggers.service';
import { LoggersController } from './controller/logger.controller';
import { TwitterService } from './service/twitter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './module/user.module';
import { B2Controller } from './controller/b2.controller';
import { B2Service } from './service/B2.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'looktempo.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
  ],
  controllers: [VideoController, AppController, LoggersController, B2Controller],
  providers: [AppService, LoggerService, TwitterService, B2Service],
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
