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
import { LineService } from './line.service';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { QueryLineDto } from './dto/query-line.dto';
import { AdminOnly, AuthGuard, RolesGuard } from '../../auth';

@ApiTags('Admin - Lines')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/lines')
@AdminOnly()
@UseGuards(AuthGuard, RolesGuard)
export class AdminLineController {
  constructor(private readonly lineService: LineService) {}

  /**
   * GET /api/v1/admin/lines
   * List all train lines
   */
  @Get()
  @ApiOperation({ summary: 'List all train lines', description: 'Returns a paginated list of train routes.' })
  @ApiResponse({ status: 200, description: 'Paginated list of lines.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query() query: QueryLineDto) {
    return this.lineService.findAll(query);
  }

  /**
   * POST /api/v1/admin/lines
   * Add a new route/line
   */
  @Post()
  @ApiOperation({ summary: 'Add a new train route/line' })
  @ApiResponse({ status: 201, description: 'Train line created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Start and End station are identical.' })
  @ApiResponse({ status: 404, description: 'Not Found - Station ID not found.' })
  async createLine(@Body() dto: CreateLineDto) {
    return this.lineService.createLine(dto);
  }

  /**
   * GET /api/v1/admin/lines/:id
   * Retrieve line configuration
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve line configuration by ID' })
  @ApiResponse({ status: 200, description: 'Line details returned.' })
  @ApiResponse({ status: 404, description: 'Not Found - Line not found.' })
  async findOne(@Param('id') id: string) {
    return this.lineService.findOne(id);
  }

  /**
   * PUT /api/v1/admin/lines/:id
   * Update route and intermediaries
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update route and intermediate stations' })
  @ApiResponse({ status: 200, description: 'Line updated successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Line not found.' })
  async updateLine(
    @Param('id') id: string,
    @Body() dto: UpdateLineDto,
  ) {
    return this.lineService.updateLine(id, dto);
  }

  /**
   * DELETE /api/v1/admin/lines/:id
   * Delete a line
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a train line' })
  @ApiResponse({ status: 200, description: 'Line deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Line assigned to trains or schedules.' })
  @ApiResponse({ status: 404, description: 'Not Found - Line not found.' })
  async removeLine(@Param('id') id: string) {
    return this.lineService.removeLine(id);
  }
}
