import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { RevenueService } from './revenue.service';
import { QueryRevenueDto } from './dto/query-revenue.dto';
import { QueryRevenueOverTimeDto } from './dto/query-revenue-over-time.dto';
import { QueryRevenueByScheduleDto } from './dto/query-revenue-by-schedule.dto';
import { QueryRevenueSegmentEfficiencyDto } from './dto/query-revenue-segment-efficiency.dto';
import { AdminOnly, AuthGuard, RolesGuard } from '../../auth';

@ApiTags('Admin - Revenue Reports')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/reports/revenue')
@AdminOnly()
@UseGuards(AuthGuard, RolesGuard)
export class AdminRevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Gross revenue summary',
    description:
      'Returns total fare collected from confirmed segment bookings with optional date and route filters.',
  })
  @ApiResponse({ status: 200, description: 'Revenue summary returned.' })
  async getSummary(@Query() query: QueryRevenueDto) {
    return this.revenueService.getSummary(query);
  }

  @Get('over-time')
  @ApiOperation({
    summary: 'Revenue over time',
    description:
      'Groups confirmed booking revenue by day, week, or month based on allocation createdAt.',
  })
  @ApiResponse({ status: 200, description: 'Revenue time series returned.' })
  async getOverTime(@Query() query: QueryRevenueOverTimeDto) {
    return this.revenueService.getOverTime(query);
  }

  @Get('by-schedule')
  @ApiOperation({
    summary: 'Revenue by schedule',
    description:
      'Aggregates fare revenue per train run to identify highest-earning schedules.',
  })
  @ApiResponse({ status: 200, description: 'Per-schedule revenue breakdown returned.' })
  async getBySchedule(@Query() query: QueryRevenueByScheduleDto) {
    return this.revenueService.getBySchedule(query);
  }

  @Get('by-coach-class')
  @ApiOperation({
    summary: 'Revenue by coach class',
    description:
      'Rolls up confirmed segment revenue by coach class using the Coach relation.',
  })
  @ApiResponse({ status: 200, description: 'Per-coach-class revenue breakdown returned.' })
  async getByCoachClass(@Query() query: QueryRevenueDto) {
    return this.revenueService.getByCoachClass(query);
  }

  @Get('segment-efficiency')
  @ApiOperation({
    summary: 'Segment efficiency by seat',
    description:
      'Shows seats with multiple confirmed segments and total fare captured per physical seat.',
  })
  @ApiResponse({ status: 200, description: 'Seat-level segment efficiency returned.' })
  async getSegmentEfficiency(@Query() query: QueryRevenueSegmentEfficiencyDto) {
    return this.revenueService.getSegmentEfficiency(query);
  }
}
