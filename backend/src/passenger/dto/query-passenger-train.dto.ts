import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryPassengerTrainDto {
  @ApiPropertyOptional({
    example: 'b2c3d4e5-f6a7-8901-bcde-234567890abc',
    description: 'Filter trains by line UUID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  line_id?: string;

  @ApiPropertyOptional({
    example: 'Udarata Menike',
    description: 'Search by train name or number',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
