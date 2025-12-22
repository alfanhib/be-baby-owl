import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './interfaces/http/whatsapp.controller';

@Module({
  imports: [CqrsModule, PrismaModule, ConfigModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

