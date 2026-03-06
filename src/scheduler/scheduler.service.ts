import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationService } from '../push/push-notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private pushNotificationService: PushNotificationService,
  ) {}

  /**
   * Gera DoseEvents do dia à meia-noite
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyDoseEvents() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    this.logger.log(`Gerando dose events para ${today.toDateString()}`);

    const schedules = await this.prisma.schedule.findMany({
      where: { days_of_week: { has: dayOfWeek } },
      include: { medication: true },
    });

    for (const schedule of schedules) {
      const scheduledDate = this.combineDateAndTime(today, schedule.time_of_day);

      const exists = await this.prisma.doseEvent.findFirst({
        where: { schedule_id: schedule.id, scheduled_for: scheduledDate },
      });

      if (!exists) {
        await this.prisma.doseEvent.create({
          data: {
            schedule_id: schedule.id,
            scheduled_for: scheduledDate,
            status: 'pending',
          },
        });
      }
    }
  }

  /**
   * Envia notificações a cada 5 minutos para doses próximas
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendPendingNotifications() {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const upcomingDoses = await this.prisma.doseEvent.findMany({
      where: { status: 'pending', scheduled_for: { gte: now, lte: fiveMinutesLater } },
      include: { schedule: { include: { medication: true } } },
    });

    for (const dose of upcomingDoses) {
      const userId = dose.schedule.medication.user_id;
      const payload = JSON.stringify({
        title: 'Hora do Remédio!',
        body: `Tome ${dose.schedule.medication.name} (${dose.schedule.quantity})`,
        doseId: dose.id,
      });

      await this.pushNotificationService.sendNotificationToUser(userId, payload);
    }
  }

  /**
   * Cria DoseEvent imediatamente ao criar/editar schedule
   */
  async generateImmediateDoseEvent(scheduleId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { medication: true },
    });
    if (!schedule) return;

    const today = new Date();
    const dayOfWeek = today.getDay();
    if (!schedule.days_of_week.includes(dayOfWeek)) return;

    const scheduledDate = this.combineDateAndTime(today, schedule.time_of_day);

    const exists = await this.prisma.doseEvent.findFirst({
      where: { schedule_id: schedule.id, scheduled_for: scheduledDate },
    });

    if (!exists) {
      await this.prisma.doseEvent.create({
        data: { schedule_id: schedule.id, scheduled_for: scheduledDate, status: 'pending' },
      });
    }
  }

  /**
   * Combina data do dia com horário do schedule
   */
  private combineDateAndTime(date: Date, time: Date): Date {
    const [hours, minutes, seconds] = time.toISOString().substr(11, 8).split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, seconds, 0);
    return combined;
  }
}