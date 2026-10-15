import {
  Body,
  Controller,
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
import { MarketplaceService } from './marketplace.service.js';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';
import { MarketplaceQueryDto } from './dto/marketplace-query.dto.js';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  /**
   * Returns a paginated list of active marketplace collections.
   * GET /api/marketplace/collections
   */
  @Get('collections')
  async getCollections(@Query() query: MarketplaceQueryDto) {
    return this.marketplaceService.getCollections(query);
  }

  /**
   * Returns full details of a single marketplace collection.
   * GET /api/marketplace/collections/:id
   */
  @Get('collections/:id')
  async getCollectionById(@Param('id') id: string) {
    return this.marketplaceService.getCollectionById(id);
  }

  /**
   * Creates a new marketplace collection. Creator only.
   * POST /api/marketplace/collections
   */
  @Post('collections')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCollection(
    @CurrentUser() userId: string,
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    return this.marketplaceService.createCollection(userId, createCollectionDto);
  }

  /**
   * Updates collection metadata. Creator only.
   * PUT /api/marketplace/collections/:id
   */
  @Put('collections/:id')
  @UseGuards(AuthGuard)
  async updateCollection(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.marketplaceService.updateCollection(id, userId, updateCollectionDto);
  }
}
