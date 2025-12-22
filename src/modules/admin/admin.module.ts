import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { IdentityModule } from '@identity/identity.module';

// Application
import { QueryHandlers } from './application/queries';
import { CommandHandlers } from './application/commands';

// Interface
import { AdminController } from './interfaces/http/admin.controller';

@Module({
  imports: [CqrsModule, PrismaModule, ConfigModule, IdentityModule],
  controllers: [AdminController],
  providers: [...QueryHandlers, ...CommandHandlers],
})
export class AdminModule {}

