import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    // 记录请求开始时间
    console.log(`Request started at ${now}`);

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - now;
        console.log(`Request completed in ${duration}ms`);
      }),
    );
  }
}