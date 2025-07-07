import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SignupModule } from './modules/signup/signup.module';
import { DbModule } from './config/db.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { EmailModule } from './modules/email/email.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SignupModule,
    DbModule,
    SchedulerModule,
    EmailModule,
  ],
})
export class AppModule {}
