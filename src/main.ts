import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SchedulerService } from './modules/scheduler/scheduler.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('PORT');

  await app.listen(port);

  const schedulerService = app.get(SchedulerService);
  schedulerService.start(Number(config.get('SCHEDULER_INTERVAL')));
}
bootstrap();
