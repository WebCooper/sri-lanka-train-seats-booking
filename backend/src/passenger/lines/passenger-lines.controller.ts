import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PassengerLineService } from './passenger-lines.service';
import { AllowAnonymous } from '../../auth';

@ApiTags('Passenger - Lines')
@Controller('lines')
@AllowAnonymous()
export class PassengerLineController {
  constructor(private readonly lineService: PassengerLineService) {}

  @Get()
  @ApiOperation({
    summary: 'List train lines',
    description: 'Returns all train lines with ordered stations for passenger filters.',
  })
  @ApiResponse({ status: 200, description: 'Lines returned.' })
  async findAll() {
    return this.lineService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get train line details',
    description: 'Returns one train line with ordered stations.',
  })
  @ApiResponse({ status: 200, description: 'Line returned.' })
  @ApiResponse({ status: 404, description: 'Line not found.' })
  async findOne(@Param('id') id: string) {
    return this.lineService.findOne(id);
  }
}
