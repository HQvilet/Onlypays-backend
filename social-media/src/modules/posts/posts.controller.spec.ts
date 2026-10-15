import { Test, TestingModule } from '@nestjs/testing';
import { NotImplementedException } from '@nestjs/common';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotImplementedException for createPost', async () => {
    await expect(controller.createPost('auth0|123', {})).rejects.toThrow(
      NotImplementedException,
    );
  });

  it('should throw NotImplementedException for getFeed', async () => {
    await expect(controller.getFeed('auth0|123', {})).rejects.toThrow(
      NotImplementedException,
    );
  });

  it('should throw NotImplementedException for getPostById', async () => {
    await expect(controller.getPostById('post-uuid-123')).rejects.toThrow(
      NotImplementedException,
    );
  });
});
