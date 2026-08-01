import { Module } from '@nestjs/common';
import { AdminScheduleController } from './admin-schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  controllers: [AdminScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
