import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { ExchangeService } from './services/exchange.service';
import { BinanceApiService } from './services/binance-api.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [OrdersService, ExchangeService, BinanceApiService],
  exports: [OrdersService], // Export for use by AlertsService
})
export class OrdersModule {}