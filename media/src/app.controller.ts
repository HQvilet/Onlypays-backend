import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type { Response } from 'express';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      service: 'media-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReady(@Res() res: Response) {
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const isConnected = this.connection.readyState === 1;
    if (isConnected) {
      return res.status(HttpStatus.OK).json({
        status: 'READY',
        database: 'connected',
      });
    }

    return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      status: 'NOT_READY',
      database: 'disconnected',
    });
  }
}
