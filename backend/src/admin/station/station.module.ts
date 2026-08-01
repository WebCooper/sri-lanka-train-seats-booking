import { Module } from '@nestjs/common';
import { AdminStationController } from './admin-station.controller';
import { StationService } from './station.service';

@Module({
  controllers: [AdminStationController],
  providers: [StationService],
  exports: [StationService],
})
export class StationModule {}
