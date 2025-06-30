import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { AlertsService } from './alerts.service';
import { ConfigModule } from '../config/config.module'; 
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module'; // Add this import

@Module({
  imports: [ConfigModule, PrismaModule, OrdersModule], // Add OrdersModule
  controllers: [WebhookController],
  providers: [AlertsService]
})
export class AlertsModule {}
