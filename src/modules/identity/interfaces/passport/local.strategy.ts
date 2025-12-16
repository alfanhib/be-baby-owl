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
      usernameField: 'email', // Use email as username field
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email.toLowerCase());

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
      fullName: user.fullName,
      role: user.role.value,
      status: user.status,
    };
  }
}
