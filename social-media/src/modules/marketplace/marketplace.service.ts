import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';
import { MarketplaceQueryDto } from './dto/marketplace-query.dto.js';

@Injectable()
export class MarketplaceService {
  async getCollections(_query: MarketplaceQueryDto) {
    throw new NotImplementedException('MarketplaceService.getCollections is not yet implemented');
  }

  async getCollectionById(_id: string) {
    throw new NotImplementedException('MarketplaceService.getCollectionById is not yet implemented');
  }

  async createCollection(_userId: string, _dto: CreateCollectionDto) {
    throw new NotImplementedException('MarketplaceService.createCollection is not yet implemented');
  }

  async updateCollection(_id: string, _userId: string, _dto: UpdateCollectionDto) {
    throw new NotImplementedException('MarketplaceService.updateCollection is not yet implemented');
  }
}
