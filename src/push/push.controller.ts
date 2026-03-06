import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PushService } from './push.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { UpdatePushSubscriptionDto } from './dto/update-push-subscription.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('push')
@UseGuards(AuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreatePushSubscriptionDto) {
    // Força o user_id do payload para evitar que alguém crie pra outro usuário
    createDto.user_id = req.user.id;
    return this.pushService.create(createDto);
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
}