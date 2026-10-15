import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CollectionStatus } from '../../../schemas/index.js';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  priceOpx?: string;

  @IsOptional()
  @IsEnum(CollectionStatus)
  status?: CollectionStatus;
}
