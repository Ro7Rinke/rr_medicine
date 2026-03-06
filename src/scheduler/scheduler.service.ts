import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

  // Executa todo dia à meia-noite para gerar os DoseEvents do dia
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyDoseEvents() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = domingo

    this.logger.log(`Gerando dose events para o dia ${today.toDateString()}`);

    // Pega todos os schedules que incluem esse dia da semana
    const schedules = await this.prisma.schedule.findMany({
      where: {
        days_of_week: { has: dayOfWeek },
      },
    });

    for (const schedule of schedules) {
      // Combina a data de hoje com o time_of_day
      const [hours, minutes, seconds] = schedule.time_of_day
        .toISOString()
        .substr(11, 8)
        .split(':')
        .map(Number);

      const scheduledDate = new Date(today);
      scheduledDate.setHours(hours, minutes, seconds, 0);

      // Evita duplicatas
      const exists = await this.prisma.doseEvent.findFirst({
        where: {
          schedule_id: schedule.id,
          scheduled_for: scheduledDate,
        },
      });

      if (!exists) {
        await this.prisma.doseEvent.create({
          data: {
            schedule_id: schedule.id,
            scheduled_for: scheduledDate,
            status: 'pending',
          },
        });
        this.logger.log(
          `DoseEvent criado para schedule ${schedule.id} às ${scheduledDate.toISOString()}`,
        );
      }
    }
  }
}