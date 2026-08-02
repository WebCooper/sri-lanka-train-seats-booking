import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../../../lib/prisma';
import { FareCalculationService } from '../../common/fare-calculation.service';
import {
  FARE_SETTINGS_ID,
  isValidTimeString,
  parseTimeToMinutes,
} from '../../common/fare.util';
import { COACH_CLASSES } from '../../common/coach.util';
import {
  CreatePeakHourRuleDto,
  FareQuoteDto,
  UpdateFareModelDto,
  UpdatePeakHourRuleDto,
} from './dto/fare-model.dto';

@Injectable()
export class FareModelService {
  constructor(private readonly fareCalculation: FareCalculationService) {}

  async getFareModel() {
    await this.fareCalculation.ensureDefaultCoachClassMultipliers();

    const [settings, coachMultipliers, peakRules] = await Promise.all([
      this.fareCalculation.getFareSettings(),
      prisma.coachClassFareMultiplier.findMany({
        orderBy: { coachClass: 'asc' },
      }),
      prisma.peakHourRule.findMany({ orderBy: { startTime: 'asc' } }),
    ]);

    return {
      flat_booking_fee: settings.flatBookingFee,
      rate_per_km: settings.ratePerKm,
      off_peak_multiplier: settings.offPeakMultiplier,
      coach_class_multipliers: coachMultipliers.map((row) => ({
        coach_class: row.coachClass,
        multiplier: row.multiplier,
      })),
      peak_hour_rules: peakRules.map((rule) => this.formatPeakRule(rule)),
      formula:
        '(flat_booking_fee + distance_km * rate_per_km) * coach_class_multiplier * peak_or_off_peak_multiplier',
    };
  }

  async updateFareModel(dto: UpdateFareModelDto) {
    const coachClasses = dto.coach_class_multipliers.map((row) => row.coach_class);
    const uniqueClasses = new Set(coachClasses);

    if (uniqueClasses.size !== coachClasses.length) {
      throw new BadRequestException('Duplicate coach class multipliers are not allowed');
    }

    const missingClasses = COACH_CLASSES.filter(
      (coachClass) => !uniqueClasses.has(coachClass),
    );

    if (missingClasses.length > 0) {
      throw new BadRequestException(
        `Missing multipliers for coach classes: ${missingClasses.join(', ')}`,
      );
    }

    await prisma.fareSettings.upsert({
      where: { id: FARE_SETTINGS_ID },
      create: {
        id: FARE_SETTINGS_ID,
        flatBookingFee: dto.flat_booking_fee,
        ratePerKm: dto.rate_per_km,
        offPeakMultiplier: dto.off_peak_multiplier,
      },
      update: {
        flatBookingFee: dto.flat_booking_fee,
        ratePerKm: dto.rate_per_km,
        offPeakMultiplier: dto.off_peak_multiplier,
      },
    });

    await Promise.all(
      dto.coach_class_multipliers.map((row) =>
        prisma.coachClassFareMultiplier.upsert({
          where: { coachClass: row.coach_class },
          create: {
            coachClass: row.coach_class,
            multiplier: row.multiplier,
          },
          update: {
            multiplier: row.multiplier,
          },
        }),
      ),
    );

    return this.getFareModel();
  }

  async listPeakRules() {
    const peakRules = await prisma.peakHourRule.findMany({
      orderBy: { startTime: 'asc' },
    });

    return { data: peakRules.map((rule) => this.formatPeakRule(rule)) };
  }

  async createPeakRule(dto: CreatePeakHourRuleDto) {
    this.validatePeakWindow(dto.start_time, dto.end_time);

    const rule = await prisma.peakHourRule.create({
      data: {
        name: dto.name,
        startTime: dto.start_time,
        endTime: dto.end_time,
        multiplier: dto.multiplier,
        daysOfWeek: dto.days_of_week ?? [1, 2, 3, 4, 5],
      },
    });

    return this.formatPeakRule(rule);
  }

  async updatePeakRule(id: string, dto: UpdatePeakHourRuleDto) {
    const existing = await prisma.peakHourRule.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Peak hour rule with ID "${id}" not found`);
    }

    const startTime = dto.start_time ?? existing.startTime;
    const endTime = dto.end_time ?? existing.endTime;
    this.validatePeakWindow(startTime, endTime);

    const rule = await prisma.peakHourRule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.start_time !== undefined ? { startTime: dto.start_time } : {}),
        ...(dto.end_time !== undefined ? { endTime: dto.end_time } : {}),
        ...(dto.multiplier !== undefined ? { multiplier: dto.multiplier } : {}),
        ...(dto.days_of_week !== undefined ? { daysOfWeek: dto.days_of_week } : {}),
      },
    });

    return this.formatPeakRule(rule);
  }

  async removePeakRule(id: string) {
    const existing = await prisma.peakHourRule.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Peak hour rule with ID "${id}" not found`);
    }

    await prisma.peakHourRule.delete({ where: { id } });

    return { message: 'Peak hour rule deleted successfully' };
  }

  async quoteFare(dto: FareQuoteDto) {
    if (dto.origin_station_id === dto.destination_station_id) {
      throw new BadRequestException('Origin and destination stations cannot be the same');
    }

    const departureTime = new Date(dto.departure_time);
    if (Number.isNaN(departureTime.getTime())) {
      throw new BadRequestException('Invalid departure_time value');
    }

    const breakdown = await this.fareCalculation.calculateSegmentFareQuote(
      dto.line_id,
      dto.origin_station_id,
      dto.destination_station_id,
      dto.coach_class,
      departureTime,
    );

    return {
      ...breakdown,
      currency: 'LKR',
      formula:
        '(flat_booking_fee + distance_km * rate_per_km) * coach_class_multiplier * peak_or_off_peak_multiplier',
    };
  }

  private validatePeakWindow(startTime: string, endTime: string) {
    if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
      throw new BadRequestException('Peak window times must use HH:mm format');
    }

    if (parseTimeToMinutes(startTime) >= parseTimeToMinutes(endTime)) {
      throw new BadRequestException('Peak start_time must be before end_time');
    }
  }

  private formatPeakRule(rule: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    multiplier: number;
    daysOfWeek: number[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: rule.id,
      name: rule.name,
      start_time: rule.startTime,
      end_time: rule.endTime,
      multiplier: rule.multiplier,
      days_of_week: rule.daysOfWeek,
      created_at: rule.createdAt.toISOString(),
      updated_at: rule.updatedAt.toISOString(),
    };
  }
}
