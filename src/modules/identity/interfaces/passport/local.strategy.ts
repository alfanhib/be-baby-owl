import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@identity/domain/services/password-hasher.interface';
import { PASSWORD_HASHER } from '@identity/domain/services/password-hasher.interface';
import { UserStatusEnum } from '@identity/domain/value-objects/user-status.vo';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {
    super({
      usernameField: 'identifier', // Use identifier field (username or email)
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    // Find user by username or email
    const user = await this.userRepository.findByUsernameOrEmail(identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status.value !== UserStatusEnum.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.passwordHash.value,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user information (will be available in request.user)
    return {
      id: user.id.value,
      email: user.email.value,
      username: user.username,
      fullName: user.fullName,
      role: user.role.value,
      status: user.status,
    };
  }
}
