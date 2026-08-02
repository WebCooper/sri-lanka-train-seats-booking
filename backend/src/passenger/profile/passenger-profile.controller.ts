import { Body, Controller, Get, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AllowAnonymous, CurrentUser } from '../../auth';
import { UpdatePassengerProfileDto } from './dto/update-passenger-profile.dto';
import { PassengerProfileService } from './passenger-profile.service';

@ApiTags('Passenger - Profile')
@Controller('profile')
@AllowAnonymous()
export class PassengerProfileController {
  constructor(private readonly profileService: PassengerProfileService) {}

  /**
   * GET /api/v1/profile/me
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get signed-in passenger profile',
    description: 'Returns the authenticated passenger profile including NIC and mobile number.',
  })
  @ApiResponse({ status: 200, description: 'Profile returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyProfile(@CurrentUser('id') userId?: string) {
    return this.profileService.getProfile(userId);
  }

  /**
   * PATCH /api/v1/profile/me
   */
  @Patch('me')
  @ApiOperation({
    summary: 'Update signed-in passenger profile',
    description: 'Updates name, NIC, mobile number, and optionally password.',
  })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateMyProfile(
    @CurrentUser('id') userId: string | undefined,
    @Body() dto: UpdatePassengerProfileDto,
    @Req() request: Request,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Sign in to update your profile.');
    }

    return this.profileService.updateProfile(userId, dto, request);
  }
}
