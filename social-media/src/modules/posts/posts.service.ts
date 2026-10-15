import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostQueryDto } from './dto/post-query.dto.js';

/**
 * Virtual service for posts domain.
 * Implementation will be plugged in with MongoDB queries and Kafka events.
 */
@Injectable()
export class PostsService {
  async createPost(_userId: string, _dto: CreatePostDto) {
    throw new NotImplementedException('PostsService.createPost is not yet implemented');
  }

  async getFeed(_userId: string, _query: PostQueryDto) {
    throw new NotImplementedException('PostsService.getFeed is not yet implemented');
  }

  async getPostById(_id: string) {
    throw new NotImplementedException('PostsService.getPostById is not yet implemented');
  }

  async updatePost(_id: string, _userId: string, _dto: UpdatePostDto) {
    throw new NotImplementedException('PostsService.updatePost is not yet implemented');
  }

  async deletePost(_id: string, _userId: string) {
    throw new NotImplementedException('PostsService.deletePost is not yet implemented');
  }

  async getPostsByCreator(_creatorId: string, _query: PostQueryDto) {
    throw new NotImplementedException('PostsService.getPostsByCreator is not yet implemented');
  }
}
