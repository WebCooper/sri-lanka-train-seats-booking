import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PassengerStationService } from './passenger-stations.service';
import { AllowAnonymous } from '../../auth';

@ApiTags('Passenger - Stations')
@Controller('stations')
@AllowAnonymous()
export class PassengerStationController {
  constructor(
    private readonly stationService: PassengerStationService,
  ) {}

  /**
   * GET /api/v1/stations
   * Fetch all stations to populate origin/destination dropdowns
   */
  @Get()
  @ApiOperation({
    summary: 'Fetch all stations for dropdowns',
    description: 'Returns list of all stations ordered alphabetically for origin and destination pickers.',
  })
  @ApiResponse({ status: 200, description: 'List of stations returned.' })
  async findAll() {
    return this.stationService.findAll();
  }
}
