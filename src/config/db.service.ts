import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DbService {
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.get('DB_USER'),
      host: this.configService.get('DB_HOST'),
      database: this.configService.get('DB_NAME'),
      password: this.configService.get('DB_PASSWORD'),
      port: this.configService.get('DB_PORT'),
    });
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
