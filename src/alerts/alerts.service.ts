import { Injectable, Logger } from '@nestjs/common';
import { WebhookPayloadDto } from './dto/webhook_payload.dto';
import { normalizeSymbol } from '../common/utils/symbol.utils';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  
  constructor(private readonly configService: ConfigService,
              private readonly prisma: PrismaService,
  ) {}
  
  async processAlert(data: WebhookPayloadDto) {
    // Normalize symbol
    const symbol = normalizeSymbol(data.symbol);
    
    // Build order parameters
    const orderParams = {
      symbol,
      side: data.side.toLowerCase(),
      type: data.type.toLowerCase(),
      quantity: data.quantity,
      ...(data.price ? { price: data.price } : {}),
      extra: {},
    };
    
    // In phase 1, we'll just log and return mock data
    // In phase 2, we'll integrate with the OrderService
    this.logger.log(`Would place order: ${JSON.stringify(orderParams)}`);
    // store in prisma 
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

    return {
      mode: this.configService.mode,
      orderParams,
      mockResult: { orderId: `mock-${Date.now()}` },
    };
  }
}