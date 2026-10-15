import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateTierDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  weight?: number;

  @IsOptional()
  @IsString()
  priceOpx?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  perks?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
