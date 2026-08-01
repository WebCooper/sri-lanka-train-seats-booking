import { Module } from '@nestjs/common';
import { AdminLineController } from './admin-line.controller';
import { LineService } from './line.service';

@Module({
  controllers: [AdminLineController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
