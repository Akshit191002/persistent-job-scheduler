import { Injectable } from '@nestjs/common';
import { DbService } from 'src/config/db.service';
import { JobService } from '../jobs/jobs.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronTime } from 'cron';

@Injectable()
export class SchedulerService {
  constructor(private readonly db: DbService, private readonly jobService: JobService) { }
  @Cron(CronExpression.EVERY_MINUTE)
  private async pollJobs() {
    console.log('Schedule jobs start...');

    const jobs = await this.jobService.getDueJobs();
    for (const job of jobs) {
      try {
        if (job.is_recurring) {
          await this.jobService.processJob(job);

          const interval = new CronTime(job.schedule);
          const nextRun = interval.getNextDateFrom(new Date()).toJSDate();

          await this.db.query(`UPDATE jobs SET status = $1, last_run = NOW(), next_run = $2, updated_at = NOW(), locked_at = NULL WHERE id = $3`,
            ['pending', nextRun, job.id]
          );
        } else {
          await this.jobService.processJob(job);
          await this.jobService.update(job.id, 'completed');
        }
      } catch (err) {
        console.error(`Error processing job ${job.id}: ${err.message}`);
        await this.db.query(`UPDATE jobs SET status = $1, locked_at = NULL, updated_at = $2 WHERE id = $3`,
          ['pending', new Date(), job.id]
        );
      }
    }
  }
}

