import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { OrderParams, OrderResult } from '../interfaces/order.interfaces';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class BinanceApiService {
  private readonly logger = new Logger(BinanceApiService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Converted from placeOrderDirectly() function in binanceApi.js
   * Places order directly via Binance REST API with HMAC-SHA256 signature
   */
  async placeOrder(orderParams: OrderParams): Promise<OrderResult> {
    try {
      const credentials = this.configService.getCurrentCredentials();
      
      // Construct API URL based on environment (mainnet vs testnet)
      const baseUrl = this.configService.isSpotTestnet 
        ? 'https://testnet.binance.vision'
        : 'https://api.binance.com';
      const endpoint = '/api/v3/order';
      const url = `${baseUrl}${endpoint}`;

      // Convert symbol format: remove slash from CCXT format (BTC/USDT -> BTCUSDT)
      const binanceSymbol = orderParams.symbol.replace('/', '');

      // Build query parameters
      const timestamp = Date.now();
      const queryParams: Record<string, any> = {
        symbol: binanceSymbol,
        side: orderParams.side.toUpperCase(),
        type: orderParams.type.toUpperCase(),
        quantity: orderParams.quantity,
        timestamp,
        recvWindow: 5000,
      };

      // Add price for limit orders
      if (orderParams.type === 'limit' && orderParams.price) {
        queryParams.price = orderParams.price;
      }

      // Create query string for signature
      const queryString = Object.keys(queryParams)
        .map(key => `${key}=${queryParams[key]}`)
        .join('&');

      // Generate HMAC-SHA256 signature
      const signature = crypto
        .createHmac('sha256', credentials.apiSecret)
        .update(queryString)
        .digest('hex');

      // Add signature to params
      queryParams.signature = signature;

      this.logger.log(`Executing Binance REST API order for ${binanceSymbol}`);
      this.logger.debug(`Request URL: ${url}`);
      this.logger.debug(`Request params: ${JSON.stringify({ ...queryParams, signature: '[HIDDEN]' })}`);

      // Execute HTTP POST request
      const response = await axios.post(url, null, {
        params: queryParams,
        headers: {
          'X-MBX-APIKEY': credentials.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.logger.log(`✅ Binance REST API order executed successfully for ${binanceSymbol}`);
      this.logger.log(`📊 Order Response: ${JSON.stringify(response.data, null, 2)}`);
      
      return {
        source: 'binance-rest',
        result: response.data,
      };

    } catch (error) {
      this.logger.error(`❌ Binance REST API order failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`API Error Details: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      throw error;
    }
  }
}