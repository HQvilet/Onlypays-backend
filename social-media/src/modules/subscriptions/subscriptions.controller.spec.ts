import { Test, TestingModule } from '@nestjs/testing';
import { NotImplementedException } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [SubscriptionsService],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotImplementedException for initiateSubscription', async () => {
    await expect(
      controller.initiateSubscription('auth0|sub-1', {
        creatorId: 'auth0|creator-1',
        tierId: '123e4567-e89b-12d3-a456-426614174000',
      }),
    ).rejects.toThrow(NotImplementedException);
  });

  it('should throw NotImplementedException for getUserSubscriptions', async () => {
    await expect(
      controller.getUserSubscriptions('auth0|sub-1'),
    ).rejects.toThrow(NotImplementedException);
  });
});
