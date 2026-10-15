import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { EngagementService } from './engagement.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CommentQueryDto } from './dto/comment-query.dto.js';

@Controller()
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  /**
   * Likes a post.
   * POST /api/posts/:postId/like
   */
  @Post('posts/:postId/like')
  @UseGuards(AuthGuard)
  async likePost(
    @Param('postId') postId: string,
    @CurrentUser() userId: string,
  ) {
    return this.engagementService.likePost(postId, userId);
  }

  /**
   * Removes a like from a post.
   * DELETE /api/posts/:postId/like
   */
  @Delete('posts/:postId/like')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikePost(
    @Param('postId') postId: string,
    @CurrentUser() userId: string,
  ) {
    await this.engagementService.unlikePost(postId, userId);
  }

  /**
   * Bookmarks a post.
   * POST /api/posts/:postId/bookmark
   */
  @Post('posts/:postId/bookmark')
  @UseGuards(AuthGuard)
  async bookmarkPost(
    @Param('postId') postId: string,
    @CurrentUser() userId: string,
  ) {
    return this.engagementService.bookmarkPost(postId, userId);
  }

  /**
   * Removes a bookmark from a post.
   * DELETE /api/posts/:postId/bookmark
   */
  @Delete('posts/:postId/bookmark')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBookmark(
    @Param('postId') postId: string,
    @CurrentUser() userId: string,
  ) {
    await this.engagementService.removeBookmark(postId, userId);
  }

  /**
   * Returns all posts bookmarked by the authenticated user.
   * GET /api/bookmarks/me
   */
  @Get('bookmarks/me')
  @UseGuards(AuthGuard)
  async getUserBookmarks(@CurrentUser() userId: string) {
    return this.engagementService.getUserBookmarks(userId);
  }

  /**
   * Returns comments for a post (paginated, public).
   * GET /api/posts/:postId/comments
   */
  @Get('posts/:postId/comments')
  async getPostComments(
    @Param('postId') postId: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.engagementService.getPostComments(postId, query);
  }

  /**
   * Adds a comment or reply to a post.
   * POST /api/posts/:postId/comments
   */
  @Post('posts/:postId/comments')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('postId') postId: string,
    @CurrentUser() userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.engagementService.addComment(postId, userId, createCommentDto);
  }

  /**
   * Deletes a comment. Only the comment author may delete it.
   * DELETE /api/comments/:commentId
   */
  @Delete('comments/:commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() userId: string,
  ) {
    await this.engagementService.deleteComment(commentId, userId);
  }
}
