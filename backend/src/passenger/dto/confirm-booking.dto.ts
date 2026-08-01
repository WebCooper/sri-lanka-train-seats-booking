import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class PassengerDetailsDto {
  @ApiProperty({ example: 'Sahan Perera', description: 'Full name of the passenger' })
  @IsString()
  @IsNotEmpty({ message: 'Passenger name is required' })
  name: string;

  @ApiProperty({ example: 'sahan.perera@example.com', description: 'Email address for ticket delivery' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Passenger email is required' })
  email: string;

  @ApiPropertyOptional({ example: '+94771234567', description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class ConfirmBookingDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Active seat hold UUID obtained from /bookings/hold',
  })
  @IsUUID('all', { message: 'hold_id must be a valid UUID' })
  @IsNotEmpty({ message: 'hold_id is required' })
  hold_id: string;

  @ApiProperty({ type: PassengerDetailsDto, description: 'Passenger contact details' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PassengerDetailsDto)
  passenger_details: PassengerDetailsDto;
}
