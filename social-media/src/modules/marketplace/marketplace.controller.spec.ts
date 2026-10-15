import { Test, TestingModule } from '@nestjs/testing';
import { NotImplementedException } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller.js';
import { MarketplaceService } from './marketplace.service.js';

describe('MarketplaceController', () => {
  let controller: MarketplaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [MarketplaceService],
    }).compile();

    controller = module.get<MarketplaceController>(MarketplaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotImplementedException for getCollections', async () => {
    await expect(controller.getCollections({})).rejects.toThrow(
      NotImplementedException,
    );
  });

  it('should throw NotImplementedException for createCollection', async () => {
    await expect(
      controller.createCollection('creator-1', {
        title: 'Collection A',
        coverImageUrl: 'https://example.com/cover.jpg',
        priceOpx: '25.00',
      }),
    ).rejects.toThrow(NotImplementedException);
  });
});
