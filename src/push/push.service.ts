import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { UpdatePushSubscriptionDto } from './dto/update-push-subscription.dto';

@Injectable()
export class PushService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePushSubscriptionDto) {
    return this.prisma.pushSubscription.create({
      data: dto,
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { user_id: userId },
    });
  }

  async findOne(id: string) {
    return this.prisma.pushSubscription.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: UpdatePushSubscriptionDto) {
    return this.prisma.pushSubscription.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.pushSubscription.delete({
      where: { id },
    });
  }
}