import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private schedulerService: SchedulerService,
  ) {}

  async create(userId: string, data: CreateScheduleDto) {
    // verifica se o medicamento pertence ao usuário
    const medication = await this.prisma.medication.findFirst({
      where: { id: data.medication_id, user_id: userId },
    });
    if (!medication) throw new Error('Medication not found or not yours');

    const schedule = await this.prisma.schedule.create({
      data: {
        medication_id: data.medication_id,
        treatment_id: data.treatment_id,
        time_of_day: data.time_of_day,
        quantity: data.quantity ?? 1,
        days_of_week: data.days_of_week ?? [0, 1, 2, 3, 4, 5, 6],
      },
    });

    // gera dose imediata do dia se aplicável
    await this.schedulerService.generateImmediateDoseEvent(schedule.id);

    return schedule;
  }

  async findAll(userId: string) {
    return this.prisma.schedule.findMany({
      where: {
        medication: { user_id: userId },
      },
      include: {
        medication: true,
        treatment: true,
      },
      orderBy: { time_of_day: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: { medication: true, treatment: true },
    });
  }

  async update(id: string, data: UpdateScheduleDto) {
    const schedule = await this.prisma.schedule.update({
      where: { id },
      data,
    });

    // gera dose imediata do dia após update
    await this.schedulerService.generateImmediateDoseEvent(schedule.id);

    return schedule;
  }

  async remove(id: string) {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}