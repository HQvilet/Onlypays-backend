import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Initiates a subscription to a creator. Publishes subscription.requested to Kafka.
   * POST /api/subscriptions
   */
  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async initiateSubscription(
    @CurrentUser() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.initiateSubscription(userId, createSubscriptionDto);
  }

  /**
   * Cancels an active subscription.
   * POST /api/subscriptions/:id/cancel
   */
  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  async cancelSubscription(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    return this.subscriptionsService.cancelSubscription(id, userId);
  }

  /**
   * Returns all subscriptions for the authenticated user.
   * GET /api/subscriptions/me
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getUserSubscriptions(@CurrentUser() userId: string) {
    return this.subscriptionsService.getUserSubscriptions(userId);
  }

  /**
   * Returns subscriber list/count for a creator (creator-only gated).
   * GET /api/subscriptions/creator/:creatorId
   */
  @Get('creator/:creatorId')
  @UseGuards(AuthGuard)
  async getCreatorSubscriptions(
    @Param('creatorId') creatorId: string,
    @CurrentUser() userId: string,
  ) {
    return this.subscriptionsService.getCreatorSubscriptions(creatorId, userId);
  }
}
