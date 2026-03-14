import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SERVICES_CONFIG } from '../config/services.config';

@Controller('health')
export class HealthController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async check() {
    let apiCore: 'up' | 'down' = 'down';
    let api: 'up' | 'down' = 'down';

    try {
      await firstValueFrom(
        this.httpService.get(SERVICES_CONFIG.API_CORE_URL),
      );
      apiCore = 'up';
    } catch {
      apiCore = 'down';
    }

    try {
      await firstValueFrom(
        this.httpService.get(SERVICES_CONFIG.API_URL),
      );
      api = 'up';
    } catch {
      api = 'down';
    }

    return { apiCore, api };
  }
}
