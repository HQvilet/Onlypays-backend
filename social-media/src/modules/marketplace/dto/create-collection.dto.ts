import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaType } from '../../../schemas/index.js';

export class CreateCollectionItemDto {
  @IsUUID()
  mediaId: string;

  @IsEnum(MediaType)
  mediaType: MediaType;

  @IsOptional()
  @IsString()
  previewUrl?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number = 0;

  @IsOptional()
  @IsString()
  title?: string;
}

export class CreateCollectionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNotEmpty()
  @IsString()
  coverImageUrl: string;

  @IsNotEmpty()
  @IsString()
  priceOpx: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCollectionItemDto)
  items?: CreateCollectionItemDto[] = [];
}
