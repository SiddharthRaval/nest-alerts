import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}
  
  get isProduction(): boolean {
    return this.nestConfigService.get('NODE_ENV') === 'production';
  }
  
  get port(): number {
    return parseInt(this.nestConfigService.get('SERVER_PORT', '3000'));
  }
  
  get mode(): string {
    return this.nestConfigService.get('MODE', 'spot-test');
  }
}