import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostQueryDto } from './dto/post-query.dto.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Creates a new feed post for the authenticated creator.
   * POST /api/posts
   */
  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @CurrentUser() userId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, createPostDto);
  }

  /**
   * Returns a cursor-paginated feed of published posts from followed creators.
   * GET /api/posts/feed
   */
  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @CurrentUser() userId: string,
    @Query() query: PostQueryDto,
  ) {
    return this.postsService.getFeed(userId, query);
  }

  /**
   * Returns a single post by UUID. Public endpoint.
   * GET /api/posts/:id
   */
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  /**
   * Updates an existing post. Only the post owner may update it.
   * PUT /api/posts/:id
   */
  @Put(':id')
  @UseGuards(AuthGuard)
  async updatePost(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, userId, updatePostDto);
  }

  /**
   * Soft-deletes a post. Only the post owner may delete it.
   * DELETE /api/posts/:id
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    await this.postsService.deletePost(id, userId);
  }

  /**
   * Returns a cursor-paginated list of published posts by a creator. Public endpoint.
   * GET /api/posts/creator/:creatorId
   */
  @Get('creator/:creatorId')
  async getPostsByCreator(
    @Param('creatorId') creatorId: string,
    @Query() query: PostQueryDto,
  ) {
    return this.postsService.getPostsByCreator(creatorId, query);
  }
}
