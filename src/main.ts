import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  const configService = app.get(ConfigService);
  await app.listen(configService.port);
  
  console.log(`Application is running on port ${configService.port}`);
  console.log(`Mode: ${configService.mode}`);
}
bootstrap();