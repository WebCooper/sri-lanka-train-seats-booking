import { Module } from '@nestjs/common';
import { PassengerStationController } from './stations/passenger-stations.controller';
import { PassengerStationService } from './stations/passenger-stations.service';
import { PassengerScheduleController } from './schedules/passenger-schedules.controller';
import { PassengerScheduleService } from './schedules/passenger-schedules.service';
import { PassengerBookingController } from './bookings/passenger-bookings.controller';
import { PassengerBookingService } from './bookings/passenger-bookings.service';
import { PassengerLineController } from './lines/passenger-lines.controller';
import { PassengerLineService } from './lines/passenger-lines.service';
import { PassengerTrainController } from './trains/passenger-trains.controller';
import { PassengerTrainService } from './trains/passenger-trains.service';
import { FareCalculationService } from '../common/fare-calculation.service';

import { SegmentAllocationService } from '../common/segment-allocation.service';

@Module({
  controllers: [
    PassengerStationController,
    PassengerLineController,
    PassengerTrainController,
    PassengerScheduleController,
    PassengerBookingController,
  ],
  providers: [
    PassengerStationService,
    PassengerLineService,
    PassengerTrainService,
    PassengerScheduleService,
    PassengerBookingService,
    FareCalculationService,
    SegmentAllocationService,
  ],
  exports: [
    PassengerStationService,
    PassengerLineService,
    PassengerTrainService,
    PassengerScheduleService,
    PassengerBookingService,
  ],
})
export class PassengerModule {}
