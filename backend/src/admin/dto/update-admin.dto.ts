import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'Jane Senior Admin', description: 'Updated name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'jane.senior@railway.lk', description: 'Updated email' })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!', description: 'Updated password' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({ example: true, description: 'Toggle active status (false bans/deactivates the admin)' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
