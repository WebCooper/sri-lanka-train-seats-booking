import { Module } from '@nestjs/common';
import { AdminCoachController } from './admin-coach.controller';
import { CoachService } from './coach.service';

@Module({
  controllers: [AdminCoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
