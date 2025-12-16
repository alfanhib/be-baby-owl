import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponse> {
    const userId = UserId.create(query.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(query.userId);
    }

    return {
      id: user.id.value,
      email: user.email.value,
      fullName: user.fullName,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      role: user.role.value,
      status: user.status.value,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
