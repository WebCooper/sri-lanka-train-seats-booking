import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CoachModule } from './coach/coach.module';
import { StationModule } from './station/station.module';
import { LineModule } from './line/line.module';
import { TrainModule } from './train/train.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    CoachModule,
    StationModule,
    LineModule,
    TrainModule,
    ScheduleModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
