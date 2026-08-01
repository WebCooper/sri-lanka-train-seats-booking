import { Module } from '@nestjs/common';
import { PassengerStationController } from './stations/passenger-stations.controller';
import { PassengerStationService } from './stations/passenger-stations.service';
import { PassengerScheduleController } from './schedules/passenger-schedules.controller';
import { PassengerScheduleService } from './schedules/passenger-schedules.service';
import { PassengerBookingController } from './bookings/passenger-bookings.controller';
import { PassengerBookingService } from './bookings/passenger-bookings.service';

@Module({
  controllers: [
    PassengerStationController,
    PassengerScheduleController,
    PassengerBookingController,
  ],
  providers: [
    PassengerStationService,
    PassengerScheduleService,
    PassengerBookingService,
  ],
  exports: [
    PassengerStationService,
    PassengerScheduleService,
    PassengerBookingService,
  ],
})
export class PassengerModule {}
