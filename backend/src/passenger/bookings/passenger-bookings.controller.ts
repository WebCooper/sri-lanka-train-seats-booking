import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PassengerBookingService } from './passenger-bookings.service';
import { HoldSeatDto } from '../dto/hold-seat.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { AllowAnonymous, CurrentUser } from '../../auth';

@ApiTags('Passenger - Bookings & Checkout')
@Controller('bookings')
@AllowAnonymous()
export class PassengerBookingController {
  constructor(
    private readonly bookingService: PassengerBookingService,
  ) {}

  /**
   * POST /api/v1/bookings/hold
   * Temporarily lock a seat for 10 minutes to prevent race conditions during checkout
   */
  @Post('hold')
  @ApiOperation({
    summary: 'Temporarily lock a seat for checkout',
    description: 'Locks a specific seat for 10 minutes to prevent double-booking during checkout.',
  })
  @ApiResponse({ status: 201, description: 'Seat held successfully for 10 minutes.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Exceeds coach seat count or invalid leg.' })
  @ApiResponse({ status: 404, description: 'Not Found - Schedule, coach, or station not found.' })
  @ApiResponse({ status: 409, description: 'Conflict - Seat currently locked or booked by another passenger.' })
  async holdSeat(
    @Body() dto: HoldSeatDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.bookingService.holdSeat(dto, userId);
  }

  /**
   * POST /api/v1/bookings
   * Confirm booking and calculate final fare
   */
  @Post()
  @ApiOperation({
    summary: 'Confirm booking and generate ticket',
    description: 'Converts an active seat hold into a confirmed ticket with PNR reference and fare amount.',
  })
  @ApiResponse({ status: 201, description: 'Booking confirmed and ticket generated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Hold expired or invalid.' })
  @ApiResponse({ status: 404, description: 'Not Found - Seat hold not found.' })
  async confirmBooking(
    @Body() dto: ConfirmBookingDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.bookingService.confirmBooking(dto, userId);
  }

  /**
   * GET /api/v1/bookings/:id
   * Retrieve confirmed ticket details by ID or PNR reference
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve confirmed ticket details',
    description: 'Returns ticket and journey information for a confirmed booking by ID or PNR reference.',
  })
  @ApiResponse({ status: 200, description: 'Confirmed ticket details returned.' })
  @ApiResponse({ status: 404, description: 'Not Found - Booking reference or ID not found.' })
  async getBookingDetails(@Param('id') id: string) {
    return this.bookingService.getBookingDetails(id);
  }
}
