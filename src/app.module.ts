import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { MedicationsModule } from './medications/medications.module'
import { SchedulesModule } from './schedules/schedules.module'
import { DosesModule } from './doses/doses.module'
import { PushModule } from './push/push.module'
import { SchedulerModule } from './scheduler/scheduler.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MedicationsModule,
    SchedulesModule,
    DosesModule,
    PushModule,
    SchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}