import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();

    const request = context
      .switchToHttp()
      .getRequest<{ method: string; url: string }>();

    return next.handle().pipe(
      // transforms data.
      // this will return { success: true, data: ... } to the client
      map((data: unknown) => {
        return {
          success: true,
          data,
        };
      }),

      // logs elapsed time the request took
      tap(() => {
        const elapsedTime = startTime - Date.now();
        console.log(
          `[${request.method}] ${request.url} - Completed in ${elapsedTime}ms`,
        );
      }),
    );
  }
}
