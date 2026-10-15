import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';

@Injectable()
export class SubscriptionsService {
  async initiateSubscription(_userId: string, _dto: CreateSubscriptionDto) {
    throw new NotImplementedException('SubscriptionsService.initiateSubscription is not yet implemented');
  }

  async cancelSubscription(_id: string, _userId: string) {
    throw new NotImplementedException('SubscriptionsService.cancelSubscription is not yet implemented');
  }

  async getUserSubscriptions(_userId: string) {
    throw new NotImplementedException('SubscriptionsService.getUserSubscriptions is not yet implemented');
  }

  async getCreatorSubscriptions(_creatorId: string, _userId: string) {
    throw new NotImplementedException('SubscriptionsService.getCreatorSubscriptions is not yet implemented');
  }
}
