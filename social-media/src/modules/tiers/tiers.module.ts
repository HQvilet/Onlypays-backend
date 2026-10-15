import { Module } from '@nestjs/common';
import { TiersController } from './tiers.controller.js';
import { TiersService } from './tiers.service.js';

@Module({
  controllers: [TiersController],
  providers: [TiersService],
  exports: [TiersService],
})
export class TiersModule {}
