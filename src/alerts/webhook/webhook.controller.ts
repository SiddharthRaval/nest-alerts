import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WebhookPayloadDto } from '../dto/webhook_payload.dto';
import { AlertsService } from '../alerts.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  
  constructor(private readonly alertsService: AlertsService) {}
  
  @Post()
  async handleWebhook(@Body() payload: WebhookPayloadDto) {
    this.logger.log(`Incoming webhook: ${JSON.stringify(payload)}`);
    
    try {
      const result = await this.alertsService.processAlert(payload);
      return { success: true, ...result };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}