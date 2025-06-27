// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { AlertsModule } from './alerts/alerts.module';
//import { Prisma } from '@prisma/client';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    AlertsModule,
    PrismaModule,
  ],
})
export class AppModule {}
