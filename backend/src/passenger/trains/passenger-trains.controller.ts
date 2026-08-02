import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PassengerTrainService } from './passenger-trains.service';
import { QueryPassengerTrainDto } from '../dto/query-passenger-train.dto';
import { AllowAnonymous } from '../../auth';

@ApiTags('Passenger - Trains')
@Controller('trains')
@AllowAnonymous()
export class PassengerTrainController {
  constructor(private readonly trainService: PassengerTrainService) {}

  @Get()
  @ApiOperation({
    summary: 'List trains',
    description: 'Returns trains with ordered coaches for passenger filters.',
  })
  @ApiResponse({ status: 200, description: 'Trains returned.' })
  async findAll(@Query() query: QueryPassengerTrainDto) {
    return this.trainService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get train details',
    description: 'Returns one train with ordered coaches.',
  })
  @ApiResponse({ status: 200, description: 'Train returned.' })
  @ApiResponse({ status: 404, description: 'Train not found.' })
  async findOne(@Param('id') id: string) {
    return this.trainService.findOne(id);
  }
}
