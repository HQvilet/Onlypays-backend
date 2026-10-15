import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateTierDto } from './dto/create-tier.dto.js';
import { UpdateTierDto } from './dto/update-tier.dto.js';

@Injectable()
export class TiersService {
  async getTiersByCreator(_creatorId: string) {
    throw new NotImplementedException('TiersService.getTiersByCreator is not yet implemented');
  }

  async getTierById(_id: string) {
    throw new NotImplementedException('TiersService.getTierById is not yet implemented');
  }

  async createTier(_userId: string, _dto: CreateTierDto) {
    throw new NotImplementedException('TiersService.createTier is not yet implemented');
  }

  async updateTier(_id: string, _userId: string, _dto: UpdateTierDto) {
    throw new NotImplementedException('TiersService.updateTier is not yet implemented');
  }

  async deleteTier(_id: string, _userId: string) {
    throw new NotImplementedException('TiersService.deleteTier is not yet implemented');
  }
}
