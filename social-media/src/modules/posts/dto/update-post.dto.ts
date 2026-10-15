import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PostStatus, PostVisibility } from '../../../schemas/index.js';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @IsOptional()
  @IsUUID()
  requiredTierId?: string;

  @IsOptional()
  @IsString()
  priceOpx?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
