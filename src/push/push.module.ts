import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationService } from './push-notification.service';

@Module({
  controllers: [PushController],
  providers: [PushService, PrismaService, PushNotificationService],
})
export class PushModule {}