import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { COACH_CLASSES } from '../../../common/coach.util';

export class QueryCoachDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'CH-A', description: 'Search by coach identifier' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by reserved status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_reserved?: boolean;

  @ApiPropertyOptional({
    example: 'FIRST',
    enum: COACH_CLASSES,
    description: 'Filter by coach class',
  })
  @IsOptional()
  @IsString()
  @IsIn([...COACH_CLASSES], {
    message: `Coach class must be one of: ${COACH_CLASSES.join(', ')}`,
  })
  coach_class?: string;
}
