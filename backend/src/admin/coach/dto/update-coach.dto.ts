import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import {
  COACH_CLASSES,
  SEAT_CONFIGURATION_PATTERN,
} from '../../../common/coach.util';

export class UpdateCoachDto {
  @ApiPropertyOptional({ example: 'CH-A1-EX', description: 'Updated coach identifier' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiPropertyOptional({ example: 60, description: 'Updated seat count' })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Seat count must be at least 1' })
  seat_count?: number;

  @ApiPropertyOptional({ example: true, description: 'Updated reservation status' })
  @IsOptional()
  @IsBoolean()
  is_reserved?: boolean;

  @ApiPropertyOptional({
    example: 'SECOND',
    enum: COACH_CLASSES,
    description: 'Updated coach travel class',
  })
  @IsOptional()
  @IsString()
  @IsIn([...COACH_CLASSES], {
    message: `Coach class must be one of: ${COACH_CLASSES.join(', ')}`,
  })
  coach_class?: string;

  @ApiPropertyOptional({
    example: '2+3',
    description: 'Updated seat layout per row',
  })
  @IsOptional()
  @IsString()
  @Matches(SEAT_CONFIGURATION_PATTERN, {
    message: 'Seat configuration must match the pattern N+N (e.g. 2+2, 3+2)',
  })
  seat_configuration?: string;
}
