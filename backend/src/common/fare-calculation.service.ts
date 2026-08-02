import { Injectable } from '@nestjs/common';
import { prisma } from '../../lib/prisma';
import {
  buildFareQuoteBreakdown,
  calculateSegmentDistanceKm,
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
    const line = await prisma.line.findUnique({
      where: { id: lineId },
      select: {
        startStationId: true,
        endStationId: true,
        startStation: { select: { cumulativeDistance: true } },
        endStation: { select: { cumulativeDistance: true } },
        stations: {
          select: { stationId: true, distanceFromStart: true },
        },
      },
    });

    if (!line) {
      return 0;
    }

    return calculateSegmentDistanceKm(originStationId, destinationStationId, {
      startStationId: line.startStationId,
      endStationId: line.endStationId,
      startCumulativeDistance: line.startStation.cumulativeDistance,
      endCumulativeDistance: line.endStation.cumulativeDistance,
      lineStations: line.stations.map((entry) => ({
        stationId: entry.stationId,
        distanceFromStart: entry.distanceFromStart,
      })),
    });
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
