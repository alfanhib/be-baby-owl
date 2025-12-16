import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@shared/infrastructure/redis/redis.service';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class JwtTokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.accessTokenSecret = this.configService.getOrThrow('JWT_SECRET');
    this.refreshTokenSecret =
      this.configService.getOrThrow('JWT_REFRESH_SECRET');
    this.accessTokenExpiresIn =
      this.configService.get('JWT_EXPIRES_IN') ?? '15m';
    this.refreshTokenExpiresIn =
      this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d';
  }

  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    // Store refresh token in Redis
    await this.storeRefreshToken(payload.sub, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(this.accessTokenExpiresIn),
    };
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload.sub, email: payload.email, role: payload.role },
      {
        secret: this.accessTokenSecret,
        expiresIn: this.parseExpiresIn(this.accessTokenExpiresIn),
      },
    );
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload.sub, type: 'refresh' },
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.parseExpiresIn(this.refreshTokenExpiresIn),
      },
    );
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.accessTokenSecret,
      });
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<{ sub: string; type: string } | null> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        type: string;
      }>(token, {
        secret: this.refreshTokenSecret,
      });

      // Check if refresh token exists in Redis
      const storedToken = await this.getStoredRefreshToken(payload.sub);
      if (storedToken !== token) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.decode<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const ttl = this.parseExpiresIn(this.refreshTokenExpiresIn);
    await this.redisService.set(`refresh_token:${userId}`, token, ttl);
  }

  private async getStoredRefreshToken(userId: string): Promise<string | null> {
    return this.redisService.get(`refresh_token:${userId}`);
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    await this.redisService.del(`refresh_token:${userId}`);
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}
