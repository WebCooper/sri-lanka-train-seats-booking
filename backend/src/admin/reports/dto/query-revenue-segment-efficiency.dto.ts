import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { QueryRevenueDto } from './query-revenue.dto';

export class QueryRevenueSegmentEfficiencyDto extends QueryRevenueDto {
  @ApiPropertyOptional({
    example: 2,
    default: 2,
    description: 'Only include seats with at least this many confirmed segments',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  min_segments?: number = 2;

  @ApiPropertyOptional({ example: 50, default: 50, description: 'Max seat rows to return' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
