import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationService } from './push-notification.service';
import { DosesModule } from '../doses/doses.module';

@Module({
  imports: [DosesModule],
  controllers: [PushController],
  providers: [PushService, PrismaService, PushNotificationService],
})
export class PushModule {}