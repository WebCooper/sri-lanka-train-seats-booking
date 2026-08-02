import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import {
  COACH_CLASSES,
  SEAT_CONFIGURATION_PATTERN,
} from '../../../common/coach.util';

export class CreateCoachDto {
  @ApiProperty({ example: 'CH-A1', description: 'Unique coach identifier or carriage code' })
  @IsString()
  @IsNotEmpty({ message: 'Coach identifier is required' })
  identifier: string;

  @ApiProperty({ example: 54, description: 'Total number of seats in this coach', minimum: 1 })
  @IsInt()
  @Min(1, { message: 'Seat count must be at least 1' })
  seat_count: number;

  @ApiPropertyOptional({ example: false, default: false, description: 'Whether this coach is reserved/class-restricted' })
  @IsOptional()
  @IsBoolean()
  is_reserved?: boolean = false;

  @ApiProperty({
    example: 'FIRST',
    enum: COACH_CLASSES,
    description: 'Coach travel class (e.g. FIRST, SECOND, THIRD, OBSERVATION)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Coach class is required' })
  @IsIn([...COACH_CLASSES], {
    message: `Coach class must be one of: ${COACH_CLASSES.join(', ')}`,
  })
  coach_class: string;

  @ApiProperty({
    example: '2+2',
    description: 'Seat layout per row (e.g. 2+2, 3+2, 1+1)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Seat configuration is required' })
  @Matches(SEAT_CONFIGURATION_PATTERN, {
    message: 'Seat configuration must match the pattern N+N (e.g. 2+2, 3+2)',
  })
  seat_configuration: string;
}
