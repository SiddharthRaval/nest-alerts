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

  // Order Service Configuration
  get useNativeApi(): boolean {
    return this.nestConfigService.get('USE_NATIVE_API', 'false') === 'true';
  }

  get allowBinanceApiFallback(): boolean {
    return this.nestConfigService.get('ALLOW_BINANCE_API_FALLBACK', 'false') === 'true';
  }

  // Spot Mainnet Credentials
  get spotMainnetApiKey(): string {
    return this.nestConfigService.get('BINANCE_SPOT_MAINNET_API_KEY', '');
  }

  get spotMainnetApiSecret(): string {
    return this.nestConfigService.get('BINANCE_SPOT_MAINNET_API_SECRET', '');
  }

  // Spot Testnet Credentials
  get spotTestnetApiKey(): string {
    return this.nestConfigService.get('BINANCE_SPOT_TESTNET_API_KEY', '');
  }

  get spotTestnetApiSecret(): string {
    return this.nestConfigService.get('BINANCE_SPOT_TESTNET_API_SECRET', '');
  }

  // Helper methods for order service
  get isSpotMainnet(): boolean {
    return this.mode === 'spot-main';
  }

  get isSpotTestnet(): boolean {
    return this.mode === 'spot-test';
  }

  getCurrentCredentials(): { apiKey: string; apiSecret: string } {
    if (this.isSpotMainnet) {
      return {
        apiKey: this.spotMainnetApiKey,
        apiSecret: this.spotMainnetApiSecret,
      };
    }
    return {
      apiKey: this.spotTestnetApiKey,
      apiSecret: this.spotTestnetApiSecret,
    };
  }
}