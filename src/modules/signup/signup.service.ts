import { Injectable } from '@nestjs/common';
import { DbService } from 'src/config/db.service';
import { EmailService } from '../email/email.service';
import { JobService } from '../jobs/jobs.service';

@Injectable()
export class SignupService {
  constructor(
    private readonly db: DbService,
    private readonly emailService: EmailService,
    private readonly jobService: JobService,
  ) { }

  async createUser(email: string) {

    const existingUser = await this.db.query(
      'SELECT * FROM users WHERE email = $1 and isDeleted = $2',
      [email, false],
    );
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    const userResult = await this.db.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING *',
      [email],
    );
    const user = userResult.rows[0];
    await this.jobService.create({
      name: 'Send Welcome Email',
      type: 'accountCreatedEmail',
      parameters: { user_id: user.id, email: user.email },
      schedule: '* * * * *',
      is_recurring: true,
      created_at: new Date(),
    });
    try {
      await this.emailService.Email(user.email);
      await this.db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['completed', user.id]);
    } catch (err) {
      console.error(`Failed to send email: ${err.message}`);
    }
  }
}
