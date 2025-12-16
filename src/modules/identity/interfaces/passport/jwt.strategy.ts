import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserStatusEnum } from '../../domain/value-objects/user-status.vo';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtTokenService: JwtTokenService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Passport JWT strategy already validates the token signature and expiration
    // Here we just need to validate the user still exists and is active

    const userId = UserId.create(payload.sub);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status.value !== UserStatusEnum.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Return user information that will be attached to request.user
    return {
      id: user.id.value,
      email: user.email.value,
      fullName: user.fullName,
      role: user.role.value,
      status: user.status,
    };
  }
}
