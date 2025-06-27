import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { AlertsService } from './alerts.service';
import { ConfigModule } from '../config/config.module'; 
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';


@Module({
  imports: [ConfigModule,PrismaModule],
  controllers: [WebhookController],
  providers: [AlertsService]
})
export class AlertsModule {}
