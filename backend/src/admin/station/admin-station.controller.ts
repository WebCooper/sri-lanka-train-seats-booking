import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { QueryStationDto } from './dto/query-station.dto';
import { AdminOnly, RolesGuard } from '../../auth';

@ApiTags('Admin - Stations')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/stations')
@AdminOnly()
@UseGuards(RolesGuard)
export class AdminStationController {
  constructor(private readonly stationService: StationService) {}

  /**
   * GET /api/v1/admin/stations
   * List all available stations
   */
  @Get()
  @ApiOperation({ summary: 'List all available stations', description: 'Returns a paginated list of stations.' })
  @ApiResponse({ status: 200, description: 'Paginated list of stations.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query() query: QueryStationDto) {
    return this.stationService.findAll(query);
  }

  /**
   * POST /api/v1/admin/stations
   * Add a new station
   */
  @Post()
  @ApiOperation({ summary: 'Add a new station' })
  @ApiResponse({ status: 201, description: 'Station created successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict - Station code already registered.' })
  async createStation(@Body() dto: CreateStationDto) {
    return this.stationService.createStation(dto);
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

  /**
   * PUT /api/v1/admin/stations/:id
   * Update station details
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update station details' })
  @ApiResponse({ status: 200, description: 'Station updated successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Station not found.' })
  async updateStation(
    @Param('id') id: string,
    @Body() dto: UpdateStationDto,
  ) {
    return this.stationService.updateStation(id, dto);
  }

  /**
   * DELETE /api/v1/admin/stations/:id
   * Remove a station
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a station' })
  @ApiResponse({ status: 200, description: 'Station deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Station assigned to lines.' })
  @ApiResponse({ status: 404, description: 'Not Found - Station not found.' })
  async removeStation(@Param('id') id: string) {
    return this.stationService.removeStation(id);
  }
}
