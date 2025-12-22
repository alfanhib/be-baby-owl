import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginCommand } from './login.command';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@identity/domain/services/password-hasher.interface';
import { PASSWORD_HASHER } from '@identity/domain/services/password-hasher.interface';
import { InvalidCredentialsError } from '@identity/domain/errors/invalid-credentials.error';
import { UserSuspendedError } from '@identity/domain/errors/user-suspended.error';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';
import { RedisService } from '@shared/infrastructure/redis/redis.service';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  mustChangePassword: boolean;
  user: {
    id: string;
    email: string;
    username?: string;
    fullName: string;
    role: string;
    avatar?: string;
  };
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    // Find user by username or email
    const user = await this.userRepository.findByUsernameOrEmail(
      command.identifier,
    );

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Check if user can login
    if (!user.canLogin()) {
      throw new UserSuspendedError();
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash.value,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Generate tokens
    const payload = {
      sub: user.id.value,
      email: user.email.value,
      role: user.role.value,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<number>(
        'jwt.refreshExpiresIn',
        30 * 24 * 60 * 60, // 30 days in seconds
      ),
    });

    // Store refresh token in Redis
    const refreshTokenKey = `refresh_token:${user.id.value}`;
    await this.redisService.set(
      refreshTokenKey,
      refreshToken,
      30 * 24 * 60 * 60, // 30 days
    );

    // Record login
    user.recordLogin(command.ipAddress, command.userAgent);
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours in seconds
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id.value,
        email: user.email.value,
        username: user.username,
        fullName: user.fullName,
        role: user.role.value,
        avatar: user.avatar,
      },
    };
  }
}
