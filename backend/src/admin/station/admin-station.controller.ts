import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { StationService } from './station.service';
import { QueryStationDto } from './dto/query-station.dto';
import { AdminOnly, AuthGuard, RolesGuard } from '../../auth';

@ApiTags('Admin - Stations')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/stations')
@AdminOnly()
@UseGuards(AuthGuard, RolesGuard)
export class AdminStationController {
  constructor(private readonly stationService: StationService) {}

  /**
   * GET /api/v1/admin/stations
   * List all available stations (Read-only reference data)
   */
  @Get()
  @ApiOperation({ summary: 'List all available stations', description: 'Returns a paginated list of stations with cumulative distances.' })
  @ApiResponse({ status: 200, description: 'Paginated list of stations.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query() query: QueryStationDto) {
    return this.stationService.findAll(query);
  }

  /**
   * GET /api/v1/admin/stations/:id
   * Retrieve station details
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve station details by ID' })
  @ApiResponse({ status: 200, description: 'Station details returned.' })
  @ApiResponse({ status: 404, description: 'Not Found - Station not found.' })
  async findOne(@Param('id') id: string) {
    return this.stationService.findOne(id);
  }
}
