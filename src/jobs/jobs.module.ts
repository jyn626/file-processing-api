import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'file-queue' })
  ]
})
export class JobsModule {}
