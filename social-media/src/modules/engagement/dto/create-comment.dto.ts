import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
