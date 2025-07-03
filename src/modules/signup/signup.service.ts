import { Injectable } from '@nestjs/common';
import { DbService } from 'src/config/db.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class SignupService {
  constructor(
    private readonly db: DbService,
    private readonly emailService: EmailService,
  ) {}

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
    const payload = { user_id: user.id, email: user.email };
    const runAt = new Date(Date.now() + 5000);

    await this.db.query(
      'INSERT INTO jobs (type, payload, run_at) VALUES ($1, $2, $3)',
      ['accountCreatedEmail', payload, runAt],
    );

    try {
      await this.emailService.Email(user.email);
      await this.db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['completed', user.id]);
    } catch (err) {
      console.error(`Failed to send email: ${err.message}`);
    }
  }
}
