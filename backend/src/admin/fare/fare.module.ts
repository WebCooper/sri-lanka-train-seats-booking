import { Module } from '@nestjs/common';
import { AdminFareModelController } from './admin-fare.controller';
import { FareModelService } from './fare.service';
import { FareCalculationService } from '../../common/fare-calculation.service';

@Module({
  controllers: [AdminFareModelController],
  providers: [FareModelService, FareCalculationService],
  exports: [FareModelService, FareCalculationService],
})
export class FareModule {}
