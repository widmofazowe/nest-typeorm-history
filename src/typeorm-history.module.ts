import { Module } from '@nestjs/common';

import { HistoryService } from './typeorm-history.service';

@Module({
  providers: [HistoryService],
  exports: [HistoryService],
})
export class TypeOrmHistoryModule {}
