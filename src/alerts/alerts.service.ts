import { Injectable, Logger } from '@nestjs/common';
import { WebhookPayloadDto } from './dto/webhook_payload.dto';
import { normalizeSymbol } from '../common/utils/symbol.utils';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/services/orders.service'; // Add this import
import { OrderParams } from '../orders/interfaces/order.interfaces'; // Add this import

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService, // Add this dependency
  ) {}
  
  async processAlert(data: WebhookPayloadDto) {
    // Normalize symbol
    const symbol = normalizeSymbol(data.symbol);
    
    // Build order parameters in exact same format as current placeOrder() function
    const orderParams: OrderParams = {
      symbol,
      side: data.side.toLowerCase() as 'buy' | 'sell',
      type: data.type.toLowerCase() as 'market' | 'limit',
      quantity: data.quantity,
      ...(data.price ? { price: data.price } : {}),
      extra: {},
    };
    
    // Store alert in database
    const created = await this.prisma.alert.create({
      data: {
        symbol,
        side: data.side,
        type: data.type,
        quantity: data.quantity,
        price: data.price ?? null,
      },
    });
    this.logger.log(`Created alert: ${JSON.stringify(created)}`);

    try {
      // Execute order using OrdersService
      const orderResult = await this.ordersService.executeOrder(orderParams);
      this.logger.log(`Order executed successfully via ${orderResult.source}`);
      
      // Store order result in database (you may want to create an Order model)
      // TODO: Add order storage to database
      
      return {
        mode: this.configService.mode,
        orderParams,
        orderResult,
        alert: created,
      };
    } catch (error) {
      this.logger.error(`Order execution failed: ${error.message}`);
      
      // Return error information without failing the webhook
      return {
        mode: this.configService.mode,
        orderParams,
        error: error.message,
        alert: created,
      };
    }
  }
}