import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { DbModule } from 'src/config/db.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DbModule,EmailModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
