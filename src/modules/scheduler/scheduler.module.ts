import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { DbModule } from 'src/config/db.module';
import { EmailModule } from '../email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from '../jobs/jobs.module';

@Module({
  imports: [DbModule, EmailModule, JobModule, ScheduleModule.forRoot()],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
