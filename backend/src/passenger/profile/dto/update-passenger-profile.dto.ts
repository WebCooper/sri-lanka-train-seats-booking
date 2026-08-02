import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdatePassengerProfileDto {
  @ApiPropertyOptional({ example: 'Sahan Perera' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '199512345678' })
  @IsOptional()
  @IsString()
  nic_number?: string;

  @ApiPropertyOptional({ example: '+94771234567' })
  @IsOptional()
  @IsString()
  mobile_number?: string;

  @ApiPropertyOptional({
    example: 'CurrentPass123!',
    description: 'Required when setting a new password',
  })
  @ValidateIf((dto) => Boolean(dto.new_password))
  @IsString()
  current_password?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePass123!',
    description: 'Leave empty to keep the current password',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  new_password?: string;
}
