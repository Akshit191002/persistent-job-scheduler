import { Injectable } from '@nestjs/common';
import { DbService } from 'src/config/db.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly db: DbService, private readonly emailService: EmailService,) {}
  private async pollJobs() {
    console.log('Schedule jobs start...');
    const now = new Date();
    const result = await this.db.query(
      `SELECT * FROM jobs
       WHERE status = 'pending' AND run_at <= $1
       ORDER BY run_at ASC
       FOR UPDATE SKIP LOCKED LIMIT 5`,
      [now],
    );

    for (const job of result.rows) {
      try {
        if (job.type === 'accountCreatedEmail') {
          const email = job.payload.email;
          console.log(`Processing job ${job.id} for email: ${email}`);
          console.log(`Sending email to ${email}`);
          await this.emailService.Email(email);
        }
        await this.db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['completed', job.id]);
      } catch (err) {
        
        console.error(`Job ${job.id} failed:`);

        const retryCount = job.retry_count;

        if (retryCount >= 4) {
          await this.db.query('UPDATE users SET isDeleted = $1 WHERE id = $2', ['true', job.payload.user_id]);
          await this.db.query(
            'UPDATE jobs SET status = $1 WHERE id = $2',['failed', job.id],
          );
        } 
        else {
          await this.db.query(`UPDATE jobs SET retry_count = retry_count + 1, run_at = $1 WHERE id = $2`,
            [new Date(Date.now() + 5000), job.id],
          );
        }

        // await this.db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['pending', job.id]);
      }
    }
  }

  start(intervalMs: number) {
    setInterval(() => this.pollJobs(), intervalMs);
  }
}
