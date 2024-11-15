import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppService } from './app.service';
import { VideoController } from './video.controller';
import { AppController } from './app.controller';
import { IpFilterMiddleware } from './middleware/ip-filter.middleware';

@Module({
  imports: [],
  controllers: [VideoController, AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpFilterMiddleware).forRoutes('*');
  }
}
