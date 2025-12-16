import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Domain
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';

// Application
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Infrastructure
import { UserRepository } from './infrastructure/persistence/user.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';

// Interface
import { AuthController } from './interfaces/http/auth.controller';
import { UsersController } from './interfaces/http/users.controller';
import {
  JwtStrategy,
  JwtRefreshStrategy,
  LocalStrategy,
} from './interfaces/passport';

@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') ?? '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    // Command & Query Handlers
    ...CommandHandlers,
    ...QueryHandlers,

    // Infrastructure Services
    JwtTokenService,

    // Passport Strategies
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,

    // Repository
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },

    // Domain Services
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER, JwtTokenService],
})
export class IdentityModule {}
