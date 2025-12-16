import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { configurations } from './config';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { RedisModule } from './shared/infrastructure/redis/redis.module';
import { EventBusModule } from './shared/infrastructure/event-bus/event-bus.module';

import { JwtAuthGuard } from './shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from './shared/interfaces/guards/roles.guard';
import { DomainExceptionFilter } from './shared/interfaces/filters/domain-exception.filter';
import { HttpExceptionFilter } from './shared/interfaces/filters/http-exception.filter';
import { AllExceptionsFilter } from './shared/interfaces/filters/all-exceptions.filter';
import { TransformInterceptor } from './shared/interfaces/interceptors/transform.interceptor';
import { LoggingInterceptor } from './shared/interfaces/interceptors/logging.interceptor';
import { CustomValidationPipe } from './shared/interfaces/pipes/validation.pipe';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules
import { IdentityModule } from './modules/identity';
import { LearningModule } from './modules/learning';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: configurations,
      envFilePath: ['.env', '.env.local'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
          limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
        },
      ],
    }),

    // Infrastructure
    PrismaModule,
    RedisModule,
    EventBusModule,

    // Feature Modules
    IdentityModule,
    LearningModule,
    // ClassManagementModule,
    // GamificationModule,
    // AssessmentModule,
    // CommunityModule,
    // BillingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Global Filters (order matters: most specific first)
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },

    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // Global Pipes
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule {}
