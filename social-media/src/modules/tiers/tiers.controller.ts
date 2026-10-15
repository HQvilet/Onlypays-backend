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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TiersService } from './tiers.service.js';
import { CreateTierDto } from './dto/create-tier.dto.js';
import { UpdateTierDto } from './dto/update-tier.dto.js';

@Controller('tiers')
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}

  /**
   * Returns all active subscription tiers offered by a creator.
   * GET /api/tiers/creator/:creatorId
   */
  @Get('creator/:creatorId')
  async getTiersByCreator(@Param('creatorId') creatorId: string) {
    return this.tiersService.getTiersByCreator(creatorId);
  }

  /**
   * Returns a single tier by UUID.
   * GET /api/tiers/:id
   */
  @Get(':id')
  async getTierById(@Param('id') id: string) {
    return this.tiersService.getTierById(id);
  }

  /**
   * Creates a new subscription tier. Creator only.
   * POST /api/tiers
   */
  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTier(
    @CurrentUser() userId: string,
    @Body() createTierDto: CreateTierDto,
  ) {
    return this.tiersService.createTier(userId, createTierDto);
  }

  /**
   * Updates an existing tier. Creator only.
   * PUT /api/tiers/:id
   */
  @Put(':id')
  @UseGuards(AuthGuard)
  async updateTier(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() updateTierDto: UpdateTierDto,
  ) {
    return this.tiersService.updateTier(id, userId, updateTierDto);
  }

  /**
   * Soft-deactivates a tier. Creator only.
   * DELETE /api/tiers/:id
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTier(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    await this.tiersService.deleteTier(id, userId);
  }
}
