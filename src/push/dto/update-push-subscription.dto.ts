import { PartialType } from '@nestjs/mapped-types';
import { CreatePushSubscriptionDto } from './create-push-subscription.dto';

export class UpdatePushSubscriptionDto extends PartialType(CreatePushSubscriptionDto) {}