import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersListQuery } from './get-users-list.query';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface UsersListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetUsersListQuery)
export class GetUsersListHandler implements IQueryHandler<GetUsersListQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersListQuery): Promise<UsersListResponse> {
    const { page, limit, role, status, search } = query;
    const skip = (page - 1) * limit;

    const { users, total } = await this.userRepository.findAll({
      skip,
      take: limit,
      role,
      status,
      search,
    });

    const userList: UserListItem[] = users.map((user) => ({
      id: user.id.value,
      email: user.email.value,
      fullName: user.fullName,
      avatar: user.avatar ?? null,
      role: user.role.value,
      status: user.status.value,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
    }));

    return {
      users: userList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
