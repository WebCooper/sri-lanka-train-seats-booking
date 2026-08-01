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
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { QueryCoachDto } from './dto/query-coach.dto';
import { AdminOnly, RolesGuard } from '../../auth';

@ApiTags('Admin - Coaches')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/coaches')
@AdminOnly()
@UseGuards(RolesGuard)
export class AdminCoachController {
  constructor(private readonly coachService: CoachService) {}

  /**
   * GET /api/v1/admin/coaches
   * List all coaches
   */
  @Get()
  @ApiOperation({ summary: 'List all coaches', description: 'Returns a paginated list of train coaches.' })
  @ApiResponse({ status: 200, description: 'Paginated list of coaches.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query() query: QueryCoachDto) {
    return this.coachService.findAll(query);
  }

  /**
   * POST /api/v1/admin/coaches
   * Add a new coach
   */
  @Post()
  @ApiOperation({ summary: 'Add a new coach' })
  @ApiResponse({ status: 201, description: 'Coach created successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict - Coach identifier already registered.' })
  async createCoach(@Body() dto: CreateCoachDto) {
    return this.coachService.createCoach(dto);
  }

  /**
   * GET /api/v1/admin/coaches/:id
   * Retrieve coach details
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve coach details by ID' })
  @ApiResponse({ status: 200, description: 'Coach details returned successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Coach not found.' })
  async findOne(@Param('id') id: string) {
    return this.coachService.findOne(id);
  }

  /**
   * PUT /api/v1/admin/coaches/:id
   * Update coach configuration
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update coach configuration' })
  @ApiResponse({ status: 200, description: 'Coach updated successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Coach not found.' })
  async updateCoach(
    @Param('id') id: string,
    @Body() dto: UpdateCoachDto,
  ) {
    return this.coachService.updateCoach(id, dto);
  }

  /**
   * DELETE /api/v1/admin/coaches/:id
   * Remove a coach from the system
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a coach from the system' })
  @ApiResponse({ status: 200, description: 'Coach deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Coach attached to active trains.' })
  @ApiResponse({ status: 404, description: 'Not Found - Coach not found.' })
  async removeCoach(@Param('id') id: string) {
    return this.coachService.removeCoach(id);
  }
}
