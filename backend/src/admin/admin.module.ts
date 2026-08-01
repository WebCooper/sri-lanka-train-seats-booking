import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TrainModule } from './train/train.module';
import { StationModule } from './station/station.module';
import { LineModule } from './line/line.module';

@Module({
  imports: [StationModule, LineModule, TrainModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
