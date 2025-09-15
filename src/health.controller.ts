import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  private serverPort: number;
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private config: ConfigService,
  ) {
    this.serverPort = this.config.get<number>('PORT') ?? 3333;
  }

  @Get('http')
  @HealthCheck()
  checkHttp() {
    return this.health.check([
      () =>
        this.http.pingCheck('docs', `http://localhost:${this.serverPort}/docs`),
    ]);
  }

  @Get('db')
  @HealthCheck()
  checkDb() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
