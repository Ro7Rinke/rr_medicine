import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoseEventDto } from './dto/create-dose-event.dto';
import { UpdateDoseEventDto } from './dto/update-dose-event.dto';

@Injectable()
export class DosesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDoseEventDto) {
    return this.prisma.doseEvent.create({
      data: {
        schedule_id: dto.schedule_id,
        scheduled_for: dto.scheduled_for,
        status: 'pending',
      },
    });
  }

  async findAllBySchedule(scheduleId: string) {
    return this.prisma.doseEvent.findMany({
      where: { schedule_id: scheduleId },
      orderBy: { scheduled_for: 'asc' },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.doseEvent.findMany({
      where: {
        schedule: { medication: { user_id: userId } },
      },
      include: { schedule: true },
      orderBy: { scheduled_for: 'asc' },
    });
  }

  async update(id: string, dto: UpdateDoseEventDto) {
    return this.prisma.doseEvent.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.doseEvent.delete({
      where: { id },
    });
  }
}