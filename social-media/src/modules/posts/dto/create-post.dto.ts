import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaType, PostStatus, PostVisibility } from '../../../schemas/index.js';

export class CreatePostAttachmentDto {
  @IsUUID()
  mediaId: string;

  @IsEnum(MediaType)
  mediaType: MediaType;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  previewUrl?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number = 0;
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility = PostVisibility.SUBSCRIBERS_ONLY;

  @IsOptional()
  @IsUUID()
  requiredTierId?: string;

  @IsOptional()
  @IsString()
  priceOpx?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.PUBLISHED;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePostAttachmentDto)
  attachments?: CreatePostAttachmentDto[] = [];
}
