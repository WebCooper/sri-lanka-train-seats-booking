import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { ALLOCATION_STATUS } from '../../common/segment-allocation.service';
import { QueryRevenueDto } from './dto/query-revenue.dto';
import {
  QueryRevenueOverTimeDto,
  RevenueGranularity,
} from './dto/query-revenue-over-time.dto';
import {
  QueryRevenueByScheduleDto,
  RevenueScheduleSort,
} from './dto/query-revenue-by-schedule.dto';
import { QueryRevenueSegmentEfficiencyDto } from './dto/query-revenue-segment-efficiency.dto';

type RevenueFilters = {
  date_from: string | null;
  date_to: string | null;
  line_id: string | null;
  schedule_id: string | null;
  train_id: string | null;
};

@Injectable()
export class RevenueService {
  private buildWhere(query: QueryRevenueDto): Prisma.SeatSegmentAllocationWhereInput {
    const { date_from, date_to, line_id, schedule_id, train_id } = query;

    return {
      status: ALLOCATION_STATUS.CONFIRMED,
      ...(date_from || date_to
        ? {
            createdAt: {
              ...(date_from ? { gte: new Date(date_from) } : {}),
              ...(date_to ? { lte: new Date(date_to) } : {}),
            },
          }
        : {}),
      ...(line_id || schedule_id || train_id
        ? {
            schedule: {
              ...(line_id ? { lineId: line_id } : {}),
              ...(schedule_id ? { id: schedule_id } : {}),
              ...(train_id ? { trainId: train_id } : {}),
            },
          }
        : {}),
    };
  }

  private buildFilters(query: QueryRevenueDto): RevenueFilters {
    return {
      date_from: query.date_from ?? null,
      date_to: query.date_to ?? null,
      line_id: query.line_id ?? null,
      schedule_id: query.schedule_id ?? null,
      train_id: query.train_id ?? null,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  async getSummary(query: QueryRevenueDto) {
    const where = this.buildWhere(query);

    const aggregate = await prisma.seatSegmentAllocation.aggregate({
      where,
      _sum: { fareAmount: true },
      _count: true,
    });

    const grossRevenue = aggregate._sum.fareAmount ?? 0;
    const bookingCount = aggregate._count;

    return {
      gross_revenue: this.round(grossRevenue),
      booking_count: bookingCount,
      segment_count: bookingCount,
      average_fare:
        bookingCount > 0 ? this.round(grossRevenue / bookingCount) : 0,
      filters: this.buildFilters(query),
    };
  }

  async getOverTime(query: QueryRevenueOverTimeDto) {
    const granularity = query.granularity ?? RevenueGranularity.DAILY;
    const truncUnit = this.resolveTruncUnit(granularity);
    const where = this.buildWhere(query);

    const allocations = await prisma.seatSegmentAllocation.findMany({
      where,
      select: { createdAt: true, fareAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const buckets = new Map<string, { revenue: number; booking_count: number }>();

    for (const row of allocations) {
      const period = this.truncateDate(row.createdAt, truncUnit);
      const existing = buckets.get(period) ?? { revenue: 0, booking_count: 0 };
      existing.revenue += row.fareAmount;
      existing.booking_count += 1;
      buckets.set(period, existing);
    }

    const series = [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, stats]) => ({
        period,
        revenue: this.round(stats.revenue),
        booking_count: stats.booking_count,
      }));

    const totals = series.reduce(
      (acc, row) => ({
        revenue: acc.revenue + row.revenue,
        booking_count: acc.booking_count + row.booking_count,
      }),
      { revenue: 0, booking_count: 0 },
    );

    return {
      granularity,
      series,
      totals: {
        revenue: this.round(totals.revenue),
        booking_count: totals.booking_count,
      },
      filters: this.buildFilters(query),
    };
  }

  async getBySchedule(query: QueryRevenueByScheduleDto) {
    const where = this.buildWhere(query);
    const limit = query.limit ?? 20;
    const sort = query.sort ?? RevenueScheduleSort.REVENUE_DESC;

    const groups = await prisma.seatSegmentAllocation.groupBy({
      by: ['scheduleId'],
      where,
      _sum: { fareAmount: true },
      _count: true,
    });

    const scheduleIds = groups.map((group) => group.scheduleId);
    const schedules = await prisma.schedule.findMany({
      where: { id: { in: scheduleIds } },
      include: {
        train: true,
        line: true,
      },
    });

    const scheduleMap = new Map(schedules.map((schedule) => [schedule.id, schedule]));

    const items = groups.map((group) => {
      const schedule = scheduleMap.get(group.scheduleId);
      const revenue = group._sum.fareAmount ?? 0;
      const bookingCount = group._count;

      return {
        schedule_id: group.scheduleId,
        train_number: schedule?.train.trainNumber ?? null,
        train_name: schedule?.train.name ?? null,
        line_name: schedule?.line.name ?? null,
        departure_time: schedule?.departureTime.toISOString() ?? null,
        revenue: this.round(revenue),
        booking_count: bookingCount,
        average_fare:
          bookingCount > 0 ? this.round(revenue / bookingCount) : 0,
      };
    });

    items.sort((a, b) => {
      if (sort === RevenueScheduleSort.REVENUE_ASC) {
        return a.revenue - b.revenue;
      }
      if (sort === RevenueScheduleSort.DEPARTURE_ASC) {
        return (a.departure_time ?? '').localeCompare(b.departure_time ?? '');
      }
      return b.revenue - a.revenue;
    });

    return {
      items: items.slice(0, limit),
      total_schedules: items.length,
      filters: this.buildFilters(query),
    };
  }

  async getByCoachClass(query: QueryRevenueDto) {
    const where = this.buildWhere(query);

    const groups = await prisma.seatSegmentAllocation.groupBy({
      by: ['coachId'],
      where,
      _sum: { fareAmount: true },
      _count: true,
    });

    const coachIds = groups.map((group) => group.coachId);
    const coaches = await prisma.coach.findMany({
      where: { id: { in: coachIds } },
      select: { id: true, coachClass: true },
    });
    const coachMap = new Map(coaches.map((coach) => [coach.id, coach.coachClass]));

    const classBuckets = new Map<
      string,
      { revenue: number; booking_count: number }
    >();

    for (const group of groups) {
      const coachClass = coachMap.get(group.coachId) ?? 'UNKNOWN';
      const existing = classBuckets.get(coachClass) ?? {
        revenue: 0,
        booking_count: 0,
      };
      existing.revenue += group._sum.fareAmount ?? 0;
      existing.booking_count += group._count;
      classBuckets.set(coachClass, existing);
    }

    const grossRevenue = [...classBuckets.values()].reduce(
      (sum, bucket) => sum + bucket.revenue,
      0,
    );

    const items = [...classBuckets.entries()]
      .map(([coachClass, stats]) => ({
        coach_class: coachClass,
        revenue: this.round(stats.revenue),
        booking_count: stats.booking_count,
        share_percent:
          grossRevenue > 0
            ? this.round((stats.revenue / grossRevenue) * 100)
            : 0,
        average_fare:
          stats.booking_count > 0
            ? this.round(stats.revenue / stats.booking_count)
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      items,
      gross_revenue: this.round(grossRevenue),
      filters: this.buildFilters(query),
    };
  }

  async getSegmentEfficiency(query: QueryRevenueSegmentEfficiencyDto) {
    const where = this.buildWhere(query);
    const minSegments = query.min_segments ?? 2;
    const limit = query.limit ?? 50;

    const groups = await prisma.seatSegmentAllocation.groupBy({
      by: ['scheduleId', 'coachId', 'seatNumber'],
      where,
      _sum: { fareAmount: true },
      _count: true,
    });

    const allSeats = groups.length;
    const multiSegmentGroups = groups.filter(
      (group) => group._count >= minSegments,
    );

    const multiSegmentRevenue = multiSegmentGroups.reduce(
      (sum, group) => sum + (group._sum.fareAmount ?? 0),
      0,
    );

    const totalSegments = groups.reduce((sum, group) => sum + group._count, 0);
    const averageSegmentsPerSeat =
      allSeats > 0 ? this.round(totalSegments / allSeats) : 0;

    const topGroups = multiSegmentGroups
      .sort(
        (a, b) => (b._sum.fareAmount ?? 0) - (a._sum.fareAmount ?? 0),
      )
      .slice(0, limit);

    const scheduleIds = [...new Set(topGroups.map((group) => group.scheduleId))];
    const coachIds = [...new Set(topGroups.map((group) => group.coachId))];

    const [schedules, coaches, segmentDetails] = await Promise.all([
      prisma.schedule.findMany({
        where: { id: { in: scheduleIds } },
        include: { train: true, line: true },
      }),
      prisma.coach.findMany({
        where: { id: { in: coachIds } },
        select: { id: true, identifier: true },
      }),
      prisma.seatSegmentAllocation.findMany({
        where: {
          ...where,
          OR: topGroups.map((group) => ({
            scheduleId: group.scheduleId,
            coachId: group.coachId,
            seatNumber: group.seatNumber,
          })),
        },
        include: {
          originStation: { select: { name: true } },
          destinationStation: { select: { name: true } },
        },
        orderBy: [{ scheduleId: 'asc' }, { coachId: 'asc' }, { seatNumber: 'asc' }],
      }),
    ]);

    const scheduleMap = new Map(schedules.map((s) => [s.id, s]));
    const coachMap = new Map(coaches.map((c) => [c.id, c]));

    const segmentMap = new Map<string, typeof segmentDetails>();
    for (const segment of segmentDetails) {
      const key = `${segment.scheduleId}:${segment.coachId}:${segment.seatNumber}`;
      const list = segmentMap.get(key) ?? [];
      list.push(segment);
      segmentMap.set(key, list);
    }

    const items = topGroups.map((group) => {
      const key = `${group.scheduleId}:${group.coachId}:${group.seatNumber}`;
      const schedule = scheduleMap.get(group.scheduleId);
      const coach = coachMap.get(group.coachId);
      const segments = segmentMap.get(key) ?? [];

      return {
        schedule_id: group.scheduleId,
        train_number: schedule?.train.trainNumber ?? null,
        line_name: schedule?.line.name ?? null,
        coach_id: group.coachId,
        coach_identifier: coach?.identifier ?? null,
        seat_number: group.seatNumber,
        segment_count: group._count,
        total_fare_collected: this.round(group._sum.fareAmount ?? 0),
        segments: segments.map((segment) => ({
          origin_station: segment.originStation.name,
          destination_station: segment.destinationStation.name,
          fare_amount: this.round(segment.fareAmount),
        })),
      };
    });

    return {
      summary: {
        seats_analyzed: allSeats,
        multi_segment_seats: multiSegmentGroups.length,
        multi_segment_revenue: this.round(multiSegmentRevenue),
        average_segments_per_seat: averageSegmentsPerSeat,
      },
      items,
      filters: this.buildFilters(query),
    };
  }

  private resolveTruncUnit(
    granularity: RevenueGranularity,
  ): 'day' | 'week' | 'month' {
    switch (granularity) {
      case RevenueGranularity.WEEKLY:
        return 'week';
      case RevenueGranularity.MONTHLY:
        return 'month';
      default:
        return 'day';
    }
  }

  private truncateDate(date: Date, unit: 'day' | 'week' | 'month'): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    if (unit === 'month') {
      return `${year}-${String(month + 1).padStart(2, '0')}-01`;
    }

    if (unit === 'week') {
      const utcDate = new Date(Date.UTC(year, month, day));
      const dayOfWeek = utcDate.getUTCDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      utcDate.setUTCDate(utcDate.getUTCDate() + diff);
      return utcDate.toISOString().slice(0, 10);
    }

    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}
