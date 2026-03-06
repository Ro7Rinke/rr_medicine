import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { DosesService } from './doses.service';
import { CreateDoseEventDto } from './dto/create-dose-event.dto';
import { UpdateDoseEventDto } from './dto/update-dose-event.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('doses')
@UseGuards(AuthGuard)
export class DosesController {
  constructor(private readonly dosesService: DosesService) {}

  @Post()
  create(@Body() createDto: CreateDoseEventDto) {
    return this.dosesService.create(createDto);
  }

  @Get('schedule/:scheduleId')
  findAllBySchedule(@Param('scheduleId') scheduleId: string) {
    return this.dosesService.findAllBySchedule(scheduleId);
  }

  @Get('user')
  findAllByUser(@Req() req) {
    return this.dosesService.findAllByUser(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDoseEventDto) {
    return this.dosesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dosesService.remove(id);
  }
}