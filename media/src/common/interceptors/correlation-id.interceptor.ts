import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';

/**
 * Propagates or generates the X-Correlation-ID header on all HTTP responses.
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse<Response>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['X-Correlation-ID'] as string) ||
      uuidv4();

    request.correlationId = correlationId;
    response.setHeader('X-Correlation-ID', correlationId);

    return next.handle();
  }
}
