import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { EmailModule } from '../email/email.module';
import { DbModule } from 'src/config/db.module';

@Module({
  imports: [DbModule, EmailModule],
  providers: [SignupService],
  controllers: [SignupController],
})
export class SignupModule {}
