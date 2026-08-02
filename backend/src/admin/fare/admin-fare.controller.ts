import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { FareModelService } from './fare.service';
import {
  CreatePeakHourRuleDto,
  FareQuoteDto,
  UpdateFareModelDto,
  UpdatePeakHourRuleDto,
} from './dto/fare-model.dto';
import { AdminOnly, RolesGuard } from '../../auth';

@ApiTags('Admin - Fare Model')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin/fare-model')
@AdminOnly()
@UseGuards(RolesGuard)
export class AdminFareModelController {
  constructor(private readonly fareModelService: FareModelService) {}

  @Get()
  @ApiOperation({
    summary: 'Get fare model configuration',
    description:
      'Returns flat booking fee, per-km rate, off-peak multiplier, coach class multipliers, and peak hour rules.',
  })
  @ApiResponse({ status: 200, description: 'Fare model configuration returned.' })
  async getFareModel() {
    return this.fareModelService.getFareModel();
  }

  @Put()
  @ApiOperation({
    summary: 'Update fare model base settings and coach class multipliers',
    description:
      'Updates flat booking fee, rate per km, off-peak multiplier, and all coach class multipliers.',
  })
  @ApiResponse({ status: 200, description: 'Fare model updated successfully.' })
  async updateFareModel(@Body() dto: UpdateFareModelDto) {
    return this.fareModelService.updateFareModel(dto);
  }

  @Post('quote')
  @ApiOperation({
    summary: 'Preview fare for a segment',
    description:
      'Calculates a fare quote using the configured fare model for a line segment, coach class, and departure time.',
  })
  @ApiResponse({ status: 200, description: 'Fare quote returned.' })
  async quoteFare(@Body() dto: FareQuoteDto) {
    return this.fareModelService.quoteFare(dto);
  }

  @Get('peak-rules')
  @ApiOperation({ summary: 'List peak hour rules' })
  @ApiResponse({ status: 200, description: 'Peak hour rules returned.' })
  async listPeakRules() {
    return this.fareModelService.listPeakRules();
  }

  @Post('peak-rules')
  @ApiOperation({ summary: 'Create a peak hour rule' })
  @ApiResponse({ status: 201, description: 'Peak hour rule created.' })
  async createPeakRule(@Body() dto: CreatePeakHourRuleDto) {
    return this.fareModelService.createPeakRule(dto);
  }

  @Put('peak-rules/:id')
  @ApiOperation({ summary: 'Update a peak hour rule' })
  @ApiResponse({ status: 200, description: 'Peak hour rule updated.' })
  @ApiResponse({ status: 404, description: 'Peak hour rule not found.' })
  async updatePeakRule(@Param('id') id: string, @Body() dto: UpdatePeakHourRuleDto) {
    return this.fareModelService.updatePeakRule(id, dto);
  }

  @Delete('peak-rules/:id')
  @ApiOperation({ summary: 'Delete a peak hour rule' })
  @ApiResponse({ status: 200, description: 'Peak hour rule deleted.' })
  @ApiResponse({ status: 404, description: 'Peak hour rule not found.' })
  async removePeakRule(@Param('id') id: string) {
    return this.fareModelService.removePeakRule(id);
  }
}
