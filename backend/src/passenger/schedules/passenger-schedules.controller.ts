import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PassengerScheduleService } from './passenger-schedules.service';
import { SearchScheduleDto } from '../dto/search-schedule.dto';
import { QuerySeatsDto } from '../dto/query-seats.dto';
import { AllowAnonymous } from '../../auth';

@ApiTags('Passenger - Schedules & Seats')
@Controller('schedules')
@AllowAnonymous()
export class PassengerScheduleController {
  constructor(
    private readonly scheduleService: PassengerScheduleService,
  ) {}

  /**
   * GET /api/v1/schedules
   * Search for available train schedules
   */
  @Get()
  @ApiOperation({
    summary: 'Search for available train schedules',
    description: 'Finds available train schedules for a given travel date, origin, and destination station.',
  })
  @ApiResponse({ status: 200, description: 'Matching schedules returned.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Same origin & destination.' })
  @ApiResponse({ status: 404, description: 'Not Found - Station not found.' })
  async searchSchedules(@Query() query: SearchScheduleDto) {
    return this.scheduleService.searchSchedules(query);
  }

  /**
   * GET /api/v1/schedules/:id/seats
   * View available seats for a specific leg of the journey
   */
  @Get(':id/seats')
  @ApiOperation({
    summary: 'View seat availability for a schedule leg',
    description: 'Returns real-time coach-by-coach seat availability map for the specified journey leg.',
  })
  @ApiResponse({ status: 200, description: 'Seat availability map returned.' })
  @ApiResponse({ status: 404, description: 'Not Found - Schedule session not found.' })
  async getSeatAvailability(
    @Param('id') id: string,
    @Query() query: QuerySeatsDto,
  ) {
    return this.scheduleService.getSeatAvailability(id, query);
  }
}
