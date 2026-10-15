import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTierDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  weight: number;

  @IsNotEmpty()
  @IsString()
  priceOpx: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  perks?: string[] = [];
}
