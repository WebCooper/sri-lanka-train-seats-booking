import { Module } from '@nestjs/common';
import { AdminTrainController } from './admin-train.controller';
import { TrainService } from './train.service';

@Module({
  controllers: [AdminTrainController],
  providers: [TrainService],
  exports: [TrainService],
})
export class TrainModule {}
