import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppService } from './app.service';
import { VideoController } from './video.controller';
import { AppController } from './app.controller';
import { IpFilterMiddleware } from './middleware/ip-filter.middleware';
import { LoggerService } from './service/loggers.service';
import { LoggersController } from './controller/logger.controller';
import { TwitterService } from './service/twitter.service';
// import { PayPalService } from './service/paypal.service';
// import { PaymentController } from './controller/pay.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './module/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '20.39.199.107',
      port: 3306,
      username: 'look',
      password: 'Blast782012',
      database: 'looktempo',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    // TypeOrmModule.forRoot({
    //   type: 'mssql',
    //   host: 'looksql.database.windows.net',
    //   port: 1433,
    //   username: 'looksql',
    //   password: 'Blast782012',
    //   database: 'looktempo',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   options: {
    //     encrypt: true,
    //   },
    //   synchronize: true,
    // }),
    UserModule,
  ],
  controllers: [VideoController, AppController, LoggersController],
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
