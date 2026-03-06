import { Module } from '@nestjs/common';
import { DosesService } from './doses.service';
import { DosesController } from './doses.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DosesController],
  providers: [DosesService, PrismaService],
})
export class DosesModule {}