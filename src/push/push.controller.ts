import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PushService } from './push.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { UpdatePushSubscriptionDto } from './dto/update-push-subscription.dto';
import { PushActionDto } from './dto/push-action.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PushNotificationService } from './push-notification.service';
import { DosesService } from '../doses/doses.service';

@Controller('push')
@UseGuards(AuthGuard)
export class PushController {
  constructor(
    private readonly pushService: PushService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly dosesService: DosesService,
  ) { }

  @Post()
  create(@Req() req, @Body() createDto: CreatePushSubscriptionDto) {
    return this.pushNotificationService.registerSubscription(req.user.id, createDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.pushService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pushService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePushSubscriptionDto) {
    return this.pushService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pushService.remove(id);
  }

  @Post('actions')
  async handleDoseAction(@Req() req, @Body() actionDto: PushActionDto) {
    // Mapeia ação para status
    const statusMap = {
      taken: 'taken' as const,
      skipped: 'skipped' as const,
    };

    // Atualiza a dose com a ação do usuário
    return this.dosesService.update(actionDto.doseId, {
      status: statusMap[actionDto.action],
      responded_at: new Date(),
    });
  }
}
