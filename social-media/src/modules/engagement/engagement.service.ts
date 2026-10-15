import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CommentQueryDto } from './dto/comment-query.dto.js';

@Injectable()
export class EngagementService {
  async likePost(_postId: string, _userId: string) {
    throw new NotImplementedException('EngagementService.likePost is not yet implemented');
  }

  async unlikePost(_postId: string, _userId: string) {
    throw new NotImplementedException('EngagementService.unlikePost is not yet implemented');
  }

  async bookmarkPost(_postId: string, _userId: string) {
    throw new NotImplementedException('EngagementService.bookmarkPost is not yet implemented');
  }

  async removeBookmark(_postId: string, _userId: string) {
    throw new NotImplementedException('EngagementService.removeBookmark is not yet implemented');
  }

  async getUserBookmarks(_userId: string) {
    throw new NotImplementedException('EngagementService.getUserBookmarks is not yet implemented');
  }

  async getPostComments(_postId: string, _query: CommentQueryDto) {
    throw new NotImplementedException('EngagementService.getPostComments is not yet implemented');
  }

  async addComment(_postId: string, _userId: string, _dto: CreateCommentDto) {
    throw new NotImplementedException('EngagementService.addComment is not yet implemented');
  }

  async deleteComment(_commentId: string, _userId: string) {
    throw new NotImplementedException('EngagementService.deleteComment is not yet implemented');
  }
}
