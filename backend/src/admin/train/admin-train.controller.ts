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
import { TrainService } from './train.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';
import { QueryTrainDto } from './dto/query-train.dto';
import { AdminOnly, AuthGuard, RolesGuard } from '../../auth';

@ApiTags('Admin - Trains')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/trains')
@AdminOnly()
@UseGuards(AuthGuard, RolesGuard)
export class AdminTrainController {
  constructor(private readonly trainService: TrainService) {}

  /**
   * GET /api/v1/admin/trains
   * List all trains with pagination and optional line_id filter
   */
  @Get()
  @ApiOperation({ summary: 'List all trains', description: 'Returns a paginated list of trains, optionally filtered by line_id or search query.' })
  @ApiResponse({ status: 200, description: 'Paginated list of trains.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid session.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role.' })
  async findAll(@Query() query: QueryTrainDto) {
    return this.trainService.findAll(query);
  }

  /**
   * POST /api/v1/admin/trains
   * Add a new train with line assignment and attached coaches
   */
  @Post()
  @ApiOperation({ summary: 'Add a new train', description: 'Creates a new train with line assignment and attached coaches.' })
  @ApiResponse({ status: 201, description: 'Train created successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict - Train number already registered.' })
  async createTrain(@Body() dto: CreateTrainDto) {
    return this.trainService.createTrain(dto);
  }

  /**
   * GET /api/v1/admin/trains/:id
   * Retrieve train details with assigned line and coaches
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve train details by ID', description: 'Returns train information including assigned line and ordered coaches.' })
  @ApiResponse({ status: 200, description: 'Train details returned successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Train not found.' })
  async findOne(@Param('id') id: string) {
    return this.trainService.findOne(id);
  }

  /**
   * PUT /api/v1/admin/trains/:id
   * Update train configuration or coach/line assignment
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update train details or coach assignment' })
  @ApiResponse({ status: 200, description: 'Train updated successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Train not found.' })
  async updateTrain(
    @Param('id') id: string,
    @Body() dto: UpdateTrainDto,
  ) {
    return this.trainService.updateTrain(id, dto);
  }

  /**
   * DELETE /api/v1/admin/trains/:id
   * Remove a train from the system
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a train from the system' })
  @ApiResponse({ status: 200, description: 'Train deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Train not found.' })
  async removeTrain(@Param('id') id: string) {
    return this.trainService.removeTrain(id);
  }
}
