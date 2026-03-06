import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateTreatmentDto) {
    return this.prisma.treatment.create({
      data: {
        user_id: userId,
        ...data,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.treatment.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.treatment.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateTreatmentDto) {
    return this.prisma.treatment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.treatment.delete({
      where: { id },
    });
  }
}