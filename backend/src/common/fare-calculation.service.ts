import { Injectable } from '@nestjs/common';
import { prisma } from '../../lib/prisma';
import {
  buildFareQuoteBreakdown,
  DEFAULT_COACH_CLASS_MULTIPLIERS,
  DEFAULT_FARE_SETTINGS,
  FARE_SETTINGS_ID,
  defaultCoachClassMultipliers,
  resolveTimeMultiplier,
  type FareQuoteBreakdown,
} from './fare.util';

@Injectable()
export class FareCalculationService {
  async getSegmentDistanceKm(
    lineId: string,
    originStationId: string,
    destinationStationId: string,
  ): Promise<number> {
    const lineStations = await prisma.lineStation.findMany({
      where: { lineId },
    });

    const line = await prisma.line.findUnique({
      where: { id: lineId },
      select: { startStationId: true, endStationId: true },
    });

    let originDist = 0;
    let destDist = 0;

    if (originStationId === line?.startStationId) {
      originDist = 0;
    } else {
      const match = lineStations.find((ls) => ls.stationId === originStationId);
      originDist = match?.distanceFromStart ?? 0;
    }

    if (destinationStationId === line?.startStationId) {
      destDist = 0;
    } else {
      const match = lineStations.find((ls) => ls.stationId === destinationStationId);
      destDist = match?.distanceFromStart ?? originDist;
    }

    return Math.abs(destDist - originDist);
  }

  async calculateSegmentFareQuote(
    lineId: string,
    originStationId: string,
    destinationStationId: string,
    coachClass: string,
    departureTime: Date,
  ): Promise<FareQuoteBreakdown> {
    const distanceKm = await this.getSegmentDistanceKm(
      lineId,
      originStationId,
      destinationStationId,
    );

    const [fareSettings, coachMultiplier, peakRules] = await Promise.all([
      this.getFareSettings(),
      this.getCoachClassMultiplier(coachClass),
      prisma.peakHourRule.findMany({ orderBy: { startTime: 'asc' } }),
    ]);

    const { multiplier: timeMultiplier, band } = resolveTimeMultiplier(
      departureTime,
      fareSettings.offPeakMultiplier,
      peakRules,
    );

    return buildFareQuoteBreakdown(
      distanceKm,
      coachClass,
      coachMultiplier,
      fareSettings.flatBookingFee,
      fareSettings.ratePerKm,
      timeMultiplier,
      band,
    );
  }

  async getFareSettings() {
    const settings = await prisma.fareSettings.findUnique({
      where: { id: FARE_SETTINGS_ID },
    });

    if (settings) {
      return settings;
    }

    return prisma.fareSettings.create({
      data: {
        id: FARE_SETTINGS_ID,
        ...DEFAULT_FARE_SETTINGS,
      },
    });
  }

  async getCoachClassMultiplier(coachClass: string): Promise<number> {
    const row = await prisma.coachClassFareMultiplier.findUnique({
      where: { coachClass },
    });

    if (row) {
      return row.multiplier;
    }

    const defaultMultiplier =
      DEFAULT_COACH_CLASS_MULTIPLIERS[
        coachClass as keyof typeof DEFAULT_COACH_CLASS_MULTIPLIERS
      ] ?? 1;

    await prisma.coachClassFareMultiplier.create({
      data: { coachClass, multiplier: defaultMultiplier },
    });

    return defaultMultiplier;
  }

  async ensureDefaultCoachClassMultipliers() {
    const existing = await prisma.coachClassFareMultiplier.findMany();
    const existingClasses = new Set(existing.map((row) => row.coachClass));

    const missing = defaultCoachClassMultipliers().filter(
      (entry) => !existingClasses.has(entry.coachClass),
    );

    if (missing.length > 0) {
      await prisma.coachClassFareMultiplier.createMany({
        data: missing,
        skipDuplicates: true,
      });
    }
  }
}
