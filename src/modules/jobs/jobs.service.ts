import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/config/db.service';
import { CreateJobDto } from './dto/createJob.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class JobService {
    constructor(
        private readonly db: DbService,
        private readonly emailService: EmailService
    ) { }

    async create(createJobDto: CreateJobDto): Promise<object> {
        const job = await this.db.query(
            `INSERT INTO jobs (name, type, parameters, schedule, is_recurring, created_at) VALUES ($1, $2, $3::jsonb, $4, $5, $6) RETURNING *`,
            [
                createJobDto.name,
                createJobDto.type,
                JSON.stringify(createJobDto.parameters),
                createJobDto.schedule,
                createJobDto.is_recurring,
                createJobDto.created_at,
            ]
        );
        return job.rows[0];
    }


    async update(id: number, status: string): Promise<object> {
        const job = await this.db.query(
            "UPDATE jobs SET status = $1, updated_at = $2, last_run = $2 WHERE id = $3 RETURNING *",
            [status, new Date(), id]
        );
        if (job.rows.length === 0) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        return job.rows[0];
    }


    async retryJob(job: any) {
        const retryCount = job.retry_count;
        const maxRetries = job.max_retry;
        if (retryCount < maxRetries) {
            await this.db.query(`UPDATE jobs SET retry_count = retry_count + 1, run_at = $1 WHERE id = $2`,
                [new Date(Date.now() + 5000), job.id],
            );
        }
        else {
            await this.db.query('UPDATE users SET isDeleted = $1 WHERE id = $2', ['true', job.parameters.user_id]);
            await this.update(job.id, 'failed');
        }
    }

    async getDueJobs(): Promise<any[]> {
        const now = new Date();
        const jobs = await this.db.query(
            `UPDATE jobs 
            SET locked_at = $1, status = 'processing', updated_at = $1 
            WHERE id IN (
            SELECT id
            FROM jobs
            WHERE status = 'pending' AND created_at <= $1 AND locked_at IS NULL
            ORDER BY created_at ASC )
            RETURNING *`, [now]
        );
        return jobs.rows;
    }

    async processJob(job: any): Promise<void> {
        console.log(`Processing job ${job.id} of type ${job.type}`);
        try {
            if (job.type === 'accountCreatedEmail') {
                await this.emailService.sendEmail(job.parameters.email);
                console.log(`Email sent to ${job.parameters.email}`);
            }
        } catch (error) {
            console.error(`Failed to process job ${job.id}:`, error);
            await this.retryJob(job);
        }

    }

}