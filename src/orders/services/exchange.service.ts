import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { ExchangeConfig } from '../interfaces/order.interfaces';
import * as ccxt from 'ccxt';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private exchangeConfig: ExchangeConfig | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Converted from initializeExchange() function in exchange.js
   * Initializes CCXT exchange client with proper configuration for spot trading
   */
  async initialize(): Promise<ExchangeConfig> {
    if (this.exchangeConfig) {
      return this.exchangeConfig;
    }

    try {
      const credentials = this.configService.getCurrentCredentials();
      const isTestnet = this.configService.isSpotTestnet;

      this.logger.log(`Initializing CCXT for ${isTestnet ? 'spot testnet' : 'spot mainnet'}`);

      // Create Binance CCXT client
      const client = new ccxt.binance({
        apiKey: credentials.apiKey,
        secret: credentials.apiSecret,
        timeout: 30000,
        rateLimit: 1200,
        enableRateLimit: true,
        // CRITICAL: Do NOT use setSandboxMode(true) for spot testnet
        sandbox: false,
      });

      // Configure URLs for spot testnet
      if (isTestnet) {
        this.logger.log('Configuring CCXT for Binance spot testnet...');
        
        // CORRECT configuration for spot testnet
        client.urls.api = {
          public: 'https://testnet.binance.vision',
          private: 'https://testnet.binance.vision',
        };
        
        // Use type assertion to handle CCXT type limitations
        (client.urls as any).sapi = 'https://dummy.testnet.binance.vision/sapi';
        (client.urls as any).wapi = 'https://dummy.testnet.binance.vision/wapi';
        
        // Custom fetch2 patching to block unsupported SAPI endpoints on spot testnet
        const logger = this.logger; // Capture logger reference
        const originalFetch = client.fetch2.bind(client);
        
        client.fetch2 = function(url: string, method: string = 'GET', headers: any = {}, body: any = undefined) {
          // Check if URL is defined and contains SAPI/WAPI endpoints
          if (url && typeof url === 'string' && (url.includes('/sapi/') || url.includes('/wapi/'))) {
            logger.warn(`🚫 Blocked SAPI/WAPI request on testnet: ${url}`);
            return Promise.resolve({ data: {} });
          }
          return originalFetch(url, method, headers, body);
        };

        this.logger.log('✅ CCXT testnet configuration completed');
      } else {
        this.logger.log('Using CCXT mainnet configuration');
      }

      // Market loading functionality (for testing only)
      try {
        this.logger.log('Loading markets...');
        await client.loadMarkets();
        this.logger.log(`✅ Markets loaded successfully for ${isTestnet ? 'testnet' : 'mainnet'}`);
      } catch (marketError) {
        // Graceful handling of market loading errors with warnings
        this.logger.warn(`⚠️ Market loading failed (continuing anyway): ${marketError.message}`);
      }

      this.exchangeConfig = {
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        isFutures: false, // Spot trading only
        isTestnet,
        client,
        useDirect: this.configService.useNativeApi,
      };

      this.logger.log(`🚀 Exchange initialized successfully - Mode: ${this.configService.mode}, Direct API: ${this.exchangeConfig.useDirect}`);
      
      return this.exchangeConfig;

    } catch (error) {
      this.logger.error(`❌ Exchange initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current exchange configuration
   */
  getConfig(): ExchangeConfig | null {
    return this.exchangeConfig;
  }

  /**
   * Reset exchange configuration (useful for testing)
   */
  reset(): void {
    this.exchangeConfig = null;
  }
}