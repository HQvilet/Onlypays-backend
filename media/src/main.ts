import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Set global API prefix '/api' while keeping root health & ready probes accessible
  app.setGlobalPrefix('api', {
    exclude: ['health', 'ready'],
  });

  // Enable request payload validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Inbound and outbound correlation ID header propagation
  app.useGlobalInterceptors(new CorrelationIdInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4003);

  await app.listen(port);
}
await bootstrap();
