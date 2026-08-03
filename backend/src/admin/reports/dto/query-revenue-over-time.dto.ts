import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { QueryRevenueDto } from './query-revenue.dto';

export enum RevenueGranularity {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class QueryRevenueOverTimeDto extends QueryRevenueDto {
  @ApiPropertyOptional({
    enum: RevenueGranularity,
    default: RevenueGranularity.DAILY,
    description: 'Time bucket size for the revenue series',
  })
  @IsOptional()
  @IsEnum(RevenueGranularity, {
    message: 'granularity must be daily, weekly, or monthly',
  })
  granularity?: RevenueGranularity = RevenueGranularity.DAILY;
}
