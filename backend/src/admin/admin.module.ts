import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CoachModule } from './coach/coach.module';
import { StationModule } from './station/station.module';
import { LineModule } from './line/line.module';
import { TrainModule } from './train/train.module';
import { ScheduleModule } from './schedule/schedule.module';
import { FareModule } from './fare/fare.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    CoachModule,
    StationModule,
    LineModule,
    TrainModule,
    ScheduleModule,
    FareModule,
    ReportsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
