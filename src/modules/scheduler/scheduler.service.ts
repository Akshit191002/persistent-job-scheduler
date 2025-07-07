import { Injectable } from '@nestjs/common';
import { DbService } from 'src/config/db.service';
import { JobService } from '../jobs/jobs.service';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class SchedulerService {
  constructor(private readonly db: DbService, private readonly jobService: JobService) {}
  @Cron(CronExpression.EVERY_MINUTE)
  private async pollJobs() {
    console.log('Schedule jobs start...');

    const jobs = await this.jobService.getDueJobs();
    for (const job of jobs) {
      try {
        if( job.is_recurring == true) {
          await this.jobService.processJob(job);
          await this.jobService.update(job.id, 'pending');
        }
        else {
          await this.jobService.processJob(job);
          await this.jobService.update(job.id, 'completed');
        }
      } catch (err) {
        await this.jobService.retryJob(job);
        console.error(`Error processing job ${job.id}: ${err.message}`);
      }
    }
  }
}

