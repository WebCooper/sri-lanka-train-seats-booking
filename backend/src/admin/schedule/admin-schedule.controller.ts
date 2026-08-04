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
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { BulkCreateScheduleDto } from './dto/bulk-create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { AdminOnly, AuthGuard, RolesGuard } from '../../auth';

@ApiTags('Admin - Schedules')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/schedules')
@AdminOnly()
@UseGuards(AuthGuard, RolesGuard)
export class AdminScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * GET /api/v1/admin/schedules
   * List upcoming train sessions
   */
  @Get()
  @ApiOperation({ summary: 'List upcoming train sessions', description: 'Returns a paginated list of scheduled train sessions, filtered by date range, line, or train.' })
  @ApiResponse({ status: 200, description: 'Paginated list of scheduled sessions.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query() query: QueryScheduleDto) {
    return this.scheduleService.findAll(query);
  }

  /**
   * POST /api/v1/admin/schedules
   * Schedule a train session
   */
  @Post()
  @ApiOperation({ summary: 'Schedule a train session' })
  @ApiResponse({ status: 201, description: 'Train session scheduled successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Arrival time must be after departure time.' })
  @ApiResponse({ status: 404, description: 'Not Found - Line ID or Train ID not found.' })
  @ApiResponse({ status: 409, description: 'Conflict - Train has an overlapping schedule.' })
  async createSchedule(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.createSchedule(dto);
  }

  /**
   * POST /api/v1/admin/schedules/bulk
   * Schedule multiple train sessions at once
   */
  @Post('bulk')
  @ApiOperation({ summary: 'Schedule multiple train sessions at once' })
  @ApiResponse({ status: 201, description: 'Bulk schedule result returned.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid session times.' })
  @ApiResponse({ status: 404, description: 'Not Found - Line ID or Train ID not found.' })
  async createBulkSchedules(@Body() dto: BulkCreateScheduleDto) {
    return this.scheduleService.createBulkSchedules(dto);
  }

  /**
   * GET /api/v1/admin/schedules/:id
   * Retrieve session details
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve session details by ID' })
  @ApiResponse({ status: 200, description: 'Schedule session details returned.' })
  @ApiResponse({ status: 404, description: 'Not Found - Schedule session not found.' })
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  /**
   * PUT /api/v1/admin/schedules/:id
   * Modify session time or assigned train
   */
  @Put(':id')
  @ApiOperation({ summary: 'Modify session time or assigned train' })
  @ApiResponse({ status: 200, description: 'Schedule session updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Arrival time must be after departure time.' })
  @ApiResponse({ status: 404, description: 'Not Found - Schedule session not found.' })
  @ApiResponse({ status: 409, description: 'Conflict - Train has an overlapping schedule.' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.updateSchedule(id, dto);
  }

  /**
   * DELETE /api/v1/admin/schedules/:id
   * Cancel a scheduled session
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a scheduled session' })
  @ApiResponse({ status: 200, description: 'Schedule session canceled successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Schedule session not found.' })
  async removeSchedule(@Param('id') id: string) {
    return this.scheduleService.removeSchedule(id);
  }
}
