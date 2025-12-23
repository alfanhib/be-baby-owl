import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetUserByIdQuery } from './get-user-by-id.query';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';

export interface UserResponse {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  mustChangePassword: boolean;
  inviteUrl: string | null;
  inviteTokenExpiry: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponse> {
    const userId = UserId.create(query.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(query.userId);
    }

    // Generate invite URL if token exists and not expired
    let inviteUrl: string | null = null;
    if (
      user.inviteToken &&
      user.inviteTokenExpiry &&
      user.inviteTokenExpiry > new Date()
    ) {
      const frontendUrl = this.configService.get<string>(
        'app.frontendUrl',
        'http://localhost:3000',
      );
      inviteUrl = `${frontendUrl}/auth/setup-password?token=${user.inviteToken}`;
    }

    return {
      id: user.id.value,
      email: user.email.value,
      username: user.username ?? null,
      fullName: user.fullName,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      role: user.role.value,
      status: user.status.value,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      mustChangePassword: user.mustChangePassword,
      inviteUrl,
      inviteTokenExpiry: user.inviteTokenExpiry ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
