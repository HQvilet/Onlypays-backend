import { Test, TestingModule } from '@nestjs/testing';
import { NotImplementedException } from '@nestjs/common';
import { TiersController } from './tiers.controller.js';
import { TiersService } from './tiers.service.js';

describe('TiersController', () => {
  let controller: TiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiersController],
      providers: [TiersService],
    }).compile();

    controller = module.get<TiersController>(TiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotImplementedException for getTiersByCreator', async () => {
    await expect(controller.getTiersByCreator('creator-1')).rejects.toThrow(
      NotImplementedException,
    );
  });

  it('should throw NotImplementedException for createTier', async () => {
    await expect(
      controller.createTier('creator-1', {
        title: 'VIP',
        weight: 1,
        priceOpx: '10.00',
      }),
    ).rejects.toThrow(NotImplementedException);
  });
});
