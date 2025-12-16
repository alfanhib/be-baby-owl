import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenCommand } from './refresh-token.command';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { RedisService } from '@shared/infrastructure/redis/redis.service';

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(command.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token exists in Redis
    const storedToken = await this.redisService.get(
      `refresh_token:${payload.sub}`,
    );

    if (!storedToken || storedToken !== command.refreshToken) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Verify user still exists and is active
    const userId = UserId.create(payload.sub);
    const user = await this.userRepository.findById(userId);

    if (!user || !user.canLogin()) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new tokens
    const newPayload = {
      sub: user.id.value,
      email: user.email.value,
      role: user.role.value,
    };

    const accessToken = this.jwtService.sign(newPayload);
    const refreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '30d',
    });

    // Update refresh token in Redis
    await this.redisService.set(
      `refresh_token:${user.id.value}`,
      refreshToken,
      30 * 24 * 60 * 60,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours
    };
  }
}
