import { Test, TestingModule } from '@nestjs/testing';
import { NotImplementedException } from '@nestjs/common';
import { EngagementController } from './engagement.controller.js';
import { EngagementService } from './engagement.service.js';

describe('EngagementController', () => {
  let controller: EngagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngagementController],
      providers: [EngagementService],
    }).compile();

    controller = module.get<EngagementController>(EngagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotImplementedException for likePost', async () => {
    await expect(controller.likePost('post-1', 'auth0|123')).rejects.toThrow(
      NotImplementedException,
    );
  });

  it('should throw NotImplementedException for addComment', async () => {
    await expect(
      controller.addComment('post-1', 'auth0|123', { content: 'test comment' }),
    ).rejects.toThrow(NotImplementedException);
  });

  it('should throw NotImplementedException for getUserBookmarks', async () => {
    await expect(controller.getUserBookmarks('auth0|123')).rejects.toThrow(
      NotImplementedException,
    );
  });
});
