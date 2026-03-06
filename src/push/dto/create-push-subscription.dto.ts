import { IsString, IsUUID } from 'class-validator';

export class CreatePushSubscriptionDto {
  @IsUUID()
  user_id: string;

  @IsString()
  endpoint: string;

  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}