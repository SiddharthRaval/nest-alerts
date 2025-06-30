import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { ExchangeService } from './exchange.service';
import { BinanceApiService } from './binance-api.service';
import { OrderParams, OrderResult } from '../interfaces/order.interfaces';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly exchangeService: ExchangeService,
    private readonly binanceApiService: BinanceApiService,
  ) {}

  /**
   * Converted from placeOrder() function in exchange.js
   * Main order execution logic with fallback mechanism
   */
  async executeOrder(orderParams: OrderParams): Promise<OrderResult> {
    this.logger.log(`🎯 Executing order: ${JSON.stringify(orderParams)}`);

    // Initialize exchange if not already done
    const exchangeConfig = await this.exchangeService.initialize();

    // Check fallback configuration
    const fallbackEnabled = this.configService.allowBinanceApiFallback;
    this.logger.log(`📋 Configuration - Direct API: ${exchangeConfig.useDirect}, Fallback enabled: ${fallbackEnabled}`);

    // Primary execution based on configuration
    if (exchangeConfig.useDirect) {
      // Use Native Binance API first
      try {
        this.logger.log('🔄 Attempting order via Native Binance API...');
        const result = await this.binanceApiService.placeOrder(orderParams);
        this.logger.log(`✅ Order executed successfully via ${result.source}`);
        return result;
      } catch (error) {
        this.logger.error(`❌ Native Binance API failed: ${error.message}`);
        
        // Fallback mechanism: Native API → CCXT (if enabled)
        if (fallbackEnabled) {
          this.logger.log('🔄 Attempting fallback to CCXT...');
          try {
            const result = await this.executeCcxtOrder(orderParams, exchangeConfig);
            return {
              ...result,
              source: 'binance-rest-fallback',
            };
          } catch (fallbackError) {
            this.logger.error(`❌ CCXT fallback also failed: ${fallbackError.message}`);
            throw new Error(`Both Native API and CCXT fallback failed. Native: ${error.message}, CCXT: ${fallbackError.message}`);
          }
        }
        
        throw error;
      }
    } else {
      // Use CCXT first
      try {
        this.logger.log('🔄 Attempting order via CCXT...');
        const result = await this.executeCcxtOrder(orderParams, exchangeConfig);
        this.logger.log(`✅ Order executed successfully via ${result.source}`);
        return result;
      } catch (error) {
        this.logger.error(`❌ CCXT failed: ${error.message}`);
        
        // Fallback mechanism: CCXT → Native API (if enabled)
        if (fallbackEnabled) {
          this.logger.log('🔄 Attempting fallback to Native Binance API...');
          try {
            const result = await this.binanceApiService.placeOrder(orderParams);
            return {
              ...result,
              source: 'binance-rest-fallback',
            };
          } catch (fallbackError) {
            this.logger.error(`❌ Native API fallback also failed: ${fallbackError.message}`);
            throw new Error(`Both CCXT and Native API fallback failed. CCXT: ${error.message}, Native: ${fallbackError.message}`);
          }
        }
        
        throw error;
      }
    }
  }

  /**
   * Execute order using CCXT library
   */
  private async executeCcxtOrder(orderParams: OrderParams, exchangeConfig: any): Promise<OrderResult> {
    try {
      const { client } = exchangeConfig;
      const { symbol, side, type, quantity, price, extra = {} } = orderParams;

      this.logger.log(`🔄 Executing CCXT order for ${symbol}`);

      // Parameter validation (quantity and price type checking)
      if (typeof quantity !== 'number' || quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }

      if (type === 'limit' && (!price || typeof price !== 'number' || price <= 0)) {
        throw new Error('Price must be a positive number for limit orders');
      }

      let result: any;

      // Conditional parameter passing to avoid CCXT BigInt errors
      const ccxtParams = { ...extra };
      
      this.logger.debug(`CCXT Parameters: ${JSON.stringify({ symbol, side, type, quantity, price, ccxtParams })}`);
      
      if (type === 'market') {
        // Market orders
        if (Object.keys(ccxtParams).length > 0) {
          result = await client.createMarketOrder(symbol, side, quantity, ccxtParams);
        } else {
          result = await client.createMarketOrder(symbol, side, quantity);
        }
      } else if (type === 'limit') {
        // Limit orders
        if (Object.keys(ccxtParams).length > 0) {
          result = await client.createLimitOrder(symbol, side, quantity, price, ccxtParams);
        } else {
          result = await client.createLimitOrder(symbol, side, quantity, price);
        }
      } else {
        throw new Error(`Unsupported order type: ${type}`);
      }

      this.logger.log(`✅ CCXT order executed successfully for ${symbol}`);
      this.logger.log(`📊 CCXT Order Response: ${JSON.stringify(result, null, 2)}`);
      
      return {
        source: 'ccxt',
        result,
      };

    } catch (error) {
      this.logger.error(`❌ CCXT order failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`CCXT Error Details: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      throw error;
    }
  }

  /**
   * Get order status (for future enhancement)
   */
  async getOrderStatus(orderId: string, symbol: string): Promise<any> {
    const exchangeConfig = await this.exchangeService.initialize();
    const { client } = exchangeConfig;
    
    return await client.fetchOrder(orderId, symbol);
  }

  /**
   * Cancel order (for future enhancement)
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    const exchangeConfig = await this.exchangeService.initialize();
    const { client } = exchangeConfig;
    
    return await client.cancelOrder(orderId, symbol);
  }
}