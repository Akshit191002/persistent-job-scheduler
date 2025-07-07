import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { EmailModule } from '../email/email.module';
import { DbModule } from 'src/config/db.module';
import { JobService } from '../jobs/jobs.service';
import { JobModule } from '../jobs/jobs.module';

@Module({
  imports: [DbModule, EmailModule, JobModule],
  providers: [SignupService],
  controllers: [SignupController],
})
export class SignupModule {}
