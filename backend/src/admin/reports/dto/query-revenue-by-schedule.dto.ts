import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { QueryRevenueDto } from './query-revenue.dto';

export enum RevenueScheduleSort {
  REVENUE_DESC = 'revenue_desc',
  REVENUE_ASC = 'revenue_asc',
  DEPARTURE_ASC = 'departure_asc',
}

export class QueryRevenueByScheduleDto extends QueryRevenueDto {
  @ApiPropertyOptional({ example: 20, default: 20, description: 'Max schedules to return' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: RevenueScheduleSort,
    default: RevenueScheduleSort.REVENUE_DESC,
    description: 'Sort order for schedule rows',
  })
  @IsOptional()
  @IsEnum(RevenueScheduleSort, {
    message: 'sort must be revenue_desc, revenue_asc, or departure_asc',
  })
  sort?: RevenueScheduleSort = RevenueScheduleSort.REVENUE_DESC;
}
