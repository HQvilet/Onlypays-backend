import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  creatorId: string;

  @IsNotEmpty()
  @IsUUID()
  tierId: string;
}
