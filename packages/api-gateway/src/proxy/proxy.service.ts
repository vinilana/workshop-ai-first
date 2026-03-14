import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SERVICES_CONFIG } from '../config/services.config';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  async forwardToApi(
    path: string,
    method: string,
    body?: any,
    query?: Record<string, any>,
  ) {
    return this.forward(SERVICES_CONFIG.API_URL, path, method, body, query);
  }

  async forwardToApiCore(
    path: string,
    method: string,
    body?: any,
    query?: Record<string, any>,
  ) {
    return this.forward(SERVICES_CONFIG.API_CORE_URL, path, method, body, query);
  }

  private async forward(
    baseUrl: string,
    path: string,
    method: string,
    body?: any,
    query?: Record<string, any>,
  ) {
    const url = `${baseUrl}${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          data: body,
          params: query,
        }),
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }
}
