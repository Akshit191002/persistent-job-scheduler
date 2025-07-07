import { Module } from '@nestjs/common';
import { DbModule } from 'src/config/db.module';
import { EmailModule } from '../email/email.module';
import { JobService } from './jobs.service';
import { SchedulerService } from '../scheduler/scheduler.service';

@Module({
  imports: [
    DbModule,
    EmailModule,
  ],
  controllers: [],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
