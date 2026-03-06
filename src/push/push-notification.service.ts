import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import webpush from 'web-push';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private prisma: PrismaService) {
    // Configura VAPID UMA única vez
    webpush.setVapidDetails(
      'mailto:ro7rinke.diabetes@gmail.com',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
  }

  /**
   * Envia payload para uma subscription específica
   */
  async sendNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: string,
  ) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
      );
      this.logger.log(`Notificação enviada para endpoint ${subscription.endpoint}`);
    } catch (error: any) {
      this.logger.error(`Erro ao enviar push: ${error.message}`);
    }
  }

  /**
   * Envia notificações para todas subscriptions de um usuário
   */
  async sendNotificationToUser(userId: string, payload: string) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { user_id: userId },
    });

    for (const sub of subscriptions) {
      await this.sendNotification(sub, payload);
    }
  }

  /**
   * Envia notificação de dose com actions (Tomei / Pulei)
   */
  async sendDoseNotification(
    userId: string,
    doseId: string,
    medicationName: string,
    quantity: string,
  ) {
    const payload = JSON.stringify({
      title: 'Hora do Remédio!',
      body: `Tome ${medicationName} (${quantity})`,
      badge: 'https://cdn.icon-icons.com/icons2/195/PNG/256/Pill_23230.png',
      icon: 'https://cdn.icon-icons.com/icons2/195/PNG/256/Pill_23230.png',
      tag: `dose-${doseId}`, // Agrupa notificações da mesma dose
      requireInteraction: true, // Não fecha automaticamente
      data: {
        doseId: doseId,
      },
      actions: [
        {
          action: 'taken',
          title: 'Tomei ✓',
          icon: 'https://cdn.icon-icons.com/icons2/2/PNG/256/check_button_alt_24728.png',
        },
        {
          action: 'skipped',
          title: 'Pulei ✗',
          icon: 'https://cdn.icon-icons.com/icons2/3/PNG/256/x_button_close_alt_24744.png',
        },
      ],
    });

    await this.sendNotificationToUser(userId, payload);
  }

  /**
   * Registra ou atualiza subscription
   * Um usuário pode ter várias subscriptions (dispositivos)
   */
  async registerSubscription(
    userId: string,
    sub: { endpoint: string; p256dh: string; auth: string },
  ) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint }, // endpoint precisa ser @unique no schema
      update: { p256dh: sub.p256dh, auth: sub.auth },
      create: {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    });
  }
}