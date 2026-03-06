import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PushController],
  providers: [PushService, PrismaService],
})
export class PushModule {}