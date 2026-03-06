import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PushNotificationService } from '../push/push-notification.service';
import { PrismaService } from '../prisma/prisma.service';
@Module({
    providers: [
        SchedulerService,
        PushNotificationService,
        PrismaService
    ],
})
export class SchedulerModule { }