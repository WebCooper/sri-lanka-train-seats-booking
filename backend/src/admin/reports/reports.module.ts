import { Module } from '@nestjs/common';
import { AdminRevenueController } from './admin-revenue.controller';
import { RevenueService } from './revenue.service';

@Module({
  controllers: [AdminRevenueController],
  providers: [RevenueService],
  exports: [RevenueService],
})
export class ReportsModule {}
